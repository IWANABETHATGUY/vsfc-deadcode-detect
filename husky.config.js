module.exports = {
  hooks: {
    'pre-commit': 'npm t && npm run lint',
  },
};
