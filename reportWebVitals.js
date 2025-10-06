const reportWebVitals = (callback) => {
  if (typeof callback === "function") {
    import("web-vitals").then((metrics) => {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = metrics;
      [getCLS, getFID, getFCP, getLCP, getTTFB].forEach((fn) => fn(callback));
    });
  }
};

export default reportWebVitals;
