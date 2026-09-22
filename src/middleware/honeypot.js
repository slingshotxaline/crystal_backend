/**
 * Simple honeypot spam guard. The frontend renders a hidden field
 * named `honeypot` that real users never fill in. If it arrives
 * populated, the request is silently accepted but never persisted
 * (so bots don't learn their submission failed) or marked as spam.
 */
function honeypotGuard(req, res, next) {
  if (req.body && req.body.honeypot) {
    return res.status(200).json({ success: true, message: 'Thank you.' });
  }
  next();
}

module.exports = honeypotGuard;
