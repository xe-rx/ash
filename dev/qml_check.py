"""Parse-check QML files on the pinned Qt 5.11 (run with the scripts/setup-qt.sh venv python).

Usage: qml_check.py FILE_OR_DIR...   Exit 0 = all good, 1 = problems, 2 = usage/toolchain error.

Per file it (1) statically rejects imports outside ALLOWED_IMPORTS and relative .js/.qml
references that do not resolve, then (2) compiles the file with QQmlComponent (Qt 5.11, offscreen)
and reports every QQmlError as `file:line:col: message`. It does not instantiate components.
"""
import os
import re
import sys

# The ONE place to allow more imports (ADR 0001: QtQuick only). To allow qb.* later, add the
# module name here and its stub directory (containing qmldir + stub .qml) to STUB_IMPORT_PATHS.
ALLOWED_IMPORTS = {"QtQuick"}
STUB_IMPORT_PATHS = []  # absolute dirs added to the engine's import path

_TOKEN = re.compile(r'"(?:\\.|[^"\\\n])*"|\'(?:\\.|[^\'\\\n])*\'|//[^\n]*|/\*.*?\*/', re.S)
_IMPORT = re.compile(r'^[ \t]*import[ \t]+("[^"\n]*"|[A-Za-z_][\w.]*)', re.M)
_PATH = re.compile(r'"([^"\n]*\.(?:js|qml))"|\'([^\'\n]*\.(?:js|qml))\'')


def strip_comments(src):
    """Blank out comments (keeping newlines so line numbers survive); keep string literals."""
    def repl(m):
        t = m.group(0)
        return t if t[0] in "\"'" else re.sub(r"[^\n]", " ", t)
    return _TOKEN.sub(repl, src)


def _line(src, pos):
    return src.count("\n", 0, pos) + 1


def _is_local(ref):
    return not (re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", ref) or ref.startswith("/"))


def static_problems(path, src):
    """Return [(line, message)] for disallowed imports and unresolved relative references."""
    out, base, code = [], os.path.dirname(path), strip_comments(src)
    seen = set()  # lines whose import already reported
    for m in _IMPORT.finditer(code):
        target, ln = m.group(1), _line(code, m.start())
        if target.startswith('"'):
            ref = target[1:-1]
            if _is_local(ref) and not os.path.exists(os.path.join(base, ref)):
                out.append((ln, "relative import does not resolve: %s" % ref))
                seen.add(ln)
        elif target not in ALLOWED_IMPORTS:
            out.append((ln, "import not allowed: %s (allowed: %s)" % (target, ", ".join(sorted(ALLOWED_IMPORTS)))))
    for m in _PATH.finditer(code):
        ref = m.group(1) or m.group(2)
        if _line(code, m.start()) not in seen and _is_local(ref) and not os.path.isfile(os.path.join(base, ref)):
            out.append((_line(code, m.start()), "relative path does not resolve: %s" % ref))
    return out


def collect(args):
    files = []
    for a in args:
        if os.path.isdir(a):
            for d, _, names in os.walk(a):
                files += [os.path.join(d, n) for n in sorted(names) if n.endswith(".qml")]
        else:
            files.append(a)
    return sorted(set(files))


def compile_problems(engine, path):
    from PyQt5.QtCore import QUrl
    from PyQt5.QtQml import QQmlComponent
    comp = QQmlComponent(engine, QUrl.fromLocalFile(os.path.abspath(path)))
    while comp.status() == QQmlComponent.Loading:
        pass  # local files load synchronously; guard only
    if comp.status() == QQmlComponent.Ready:
        return []
    errs = [(e.line(), e.column(), e.description()) for e in comp.errors()]
    return errs or [(0, 0, "component failed to load (status %s)" % comp.status())]


def main(argv):
    files = collect(argv)
    if not files:
        print("qml_check: no QML files given", file=sys.stderr)
        return 2
    try:
        from PyQt5.QtCore import QT_VERSION_STR
        from PyQt5.QtGui import QGuiApplication
        from PyQt5.QtQml import QQmlEngine
    except ImportError as e:
        print("qml_check: PyQt5 not importable (%s); run scripts/setup-qt.sh" % e, file=sys.stderr)
        return 2
    if not QT_VERSION_STR.startswith("5.11."):
        print("qml_check: need Qt 5.11.x, found %s" % QT_VERSION_STR, file=sys.stderr)
        return 2
    os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
    os.environ.setdefault("QT_QUICK_BACKEND", "software")
    app = QGuiApplication(["qml_check"])  # noqa: F841  (must stay alive)
    engine = QQmlEngine()
    for p in STUB_IMPORT_PATHS:
        engine.addImportPath(p)
    bad = 0
    for f in files:
        try:
            with open(f, encoding="utf-8") as fh:
                src = fh.read()
        except OSError as e:
            print("%s: cannot read: %s" % (f, e))
            bad += 1
            continue
        probs = [(ln, 0, m) for ln, m in static_problems(f, src)]
        if not probs:  # only compile statically-clean files; avoids noisy duplicate errors
            probs = compile_problems(engine, f)
        for ln, col, msg in probs:
            print("%s:%d:%d: %s" % (f, ln, col, msg))
        bad += bool(probs)
    print("qml_check: Qt %s, %d file(s), %d with errors" % (QT_VERSION_STR, len(files), bad))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
