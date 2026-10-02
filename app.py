import streamlit as st
from pathlib import Path

st.set_page_config(
    page_title="CertificateMaker",
    page_icon="📜",
    layout="wide"
)

BASE_DIR = Path(__file__).parent

html_file = BASE_DIR / "index.html"
css_file = BASE_DIR / "style.css"
js_file = BASE_DIR / "script.js"

if not html_file.exists():
    st.error("index.html file not found.")
    st.stop()

html = html_file.read_text(encoding="utf-8")

# Load CSS
if css_file.exists():
    css = css_file.read_text(encoding="utf-8")

    html = html.replace(
        '<link rel="stylesheet" href="style.css">',
        '<style>' + css + '</style>'
    )

# Load JavaScript
if js_file.exists():
    js = js_file.read_text(encoding="utf-8")

    html = html.replace(
        '<script src="script.js"></script>',
        '<script>' + js + '</script>'
    )

# Show the website inside Streamlit
st.components.v1.html(
    html,
    height=3000,
    scrolling=True
)