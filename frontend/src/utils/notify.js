function notify(message, type = "info", timeout = 4000) {
  try {
    const ev = new CustomEvent("kangaru:notify", { detail: { message, type, timeout } });
    window.dispatchEvent(ev);
  } catch (e) {
    // fallback: console
    console.log("NOTIFY:", type, message);
  }
}

export default notify;
