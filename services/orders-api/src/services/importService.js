async function process(req) {
  const dryRun = req.body.dryRun;
  if (dryRun) {
    return { processed: 0, dryRun };
  }
  return { processed: 1, dryRun };
}

module.exports = { process };
