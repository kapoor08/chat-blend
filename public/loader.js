// loader.js — tiny loader
(function () {
  if (window.__QUERYON_WIDGET_LOADED__) return;
  window.__QUERYON_WIDGET_LOADED__ = true;

  var script =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  var data = script && script.dataset ? script.dataset : {};
  var base =
    script && script.src
      ? script.src.replace(/\/loader\.js(?:\?.*)?$/, "/")
      : "https://cdn.example.com/queryon-widget/";
  var esm = base + "queryon-widget.es.js";
  var umd = base + "queryon-widget.umd.js";

  // create host container ID
  var containerId = data.containerId || "queryon-widget-container";
  var container = document.createElement("div");
  container.id = containerId;

  if (script && script.parentNode) script.parentNode.insertBefore(container, script.nextSibling);
  else document.body.appendChild(container);

  // helper: convert dataset keys to props (strings)
  var props = {};
  try {
    Object.keys(data).forEach(function (k) {
      // dataset keys are already camelCased by browsers (data-apiKey -> dataset.apiKey)
      props[k] = data[k];
    });
  } catch (e) {}

  // Modern browsers: dynamic import the ESM bundle and call mount
  var moduleScript = document.createElement("script");
  moduleScript.type = "module";
  moduleScript.text =
    "import('" +
    esm +
    "').then(function(mod){ if(mod && mod.mount) mod.mount(document.getElementById('" +
    containerId +
    "'), " +
    JSON.stringify(props) +
    "); }).catch(function(err){ console.error('Queryon widget ESM failed', err); });";
  document.head.appendChild(moduleScript);

  // Old browsers fallback: load UMD and call global
  var nomoduleScript = document.createElement("script");
  nomoduleScript.noModule = true;
  nomoduleScript.src = umd;
  nomoduleScript.onload = function () {
    try {
      if (window.QueryonWidget && window.QueryonWidget.mount) {
        window.QueryonWidget.mount(document.getElementById(containerId), props);
      } else if (window.default && window.default.mount) {
        window.default.mount(document.getElementById(containerId), props);
      }
    } catch (err) {
      console.error("Queryon widget UMD mount failed", err);
    }
  };
  nomoduleScript.onerror = function (e) {
    console.error("Queryon widget UMD load failed", e);
  };
  document.head.appendChild(nomoduleScript);
})();
