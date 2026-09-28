export default {
  extends: ["stylelint-config-recommended"],
  rules: {
    // This site deliberately layers state and responsive overrides later.
    "no-descending-specificity": null,
    "no-duplicate-selectors": null,
  },
};
