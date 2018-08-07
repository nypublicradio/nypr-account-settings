export default function getScript(source, callback) {
  /**
   * Loads and executes a script asynchronously; using this here so the
   * reCaptcha script isn't executed on every page, but only when the user
   * hits the sign up page.
   *
   * getScript snippet taken from https://stackoverflow.com/a/28002292
   */
  var script = document.createElement("script");
  var prior = document.getElementsByTagName("script")[0];
  script.async = 1;

  script.onload = script.onreadystatechange = function(_, isAbort) {
    if (
      isAbort ||
      !script.readyState ||
      /loaded|complete/.test(script.readyState)
    ) {
      script.onload = script.onreadystatechange = null;
      script = undefined;

      if (!isAbort && callback) {
        callback();
      }
    }
  };

  script.src = source;
  prior.parentNode.insertBefore(script, prior);
}
