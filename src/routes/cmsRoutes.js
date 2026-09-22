const express = require('express');
const crudFactory = require('../controllers/crudFactory');
const { protect, restrictTo } = require('../middleware/auth');

const Service = require('../models/Service');
const Industry = require('../models/Industry');
const Location = require('../models/Location');
const CaseStudy = require('../models/CaseStudy');
const Insight = require('../models/Insight');
const Job = require('../models/Job');
const Page = require('../models/Page');
const Redirect = require('../models/Redirect');
const Document = require('../models/Document');

const router = express.Router();

/**
 * Mounts public + admin CRUD routes for one content type under a
 * given base path, e.g. buildResource('/services', Service).
 *   GET    /public                -> published items only
 *   GET    /public/:slug          -> one published item by slug
 *   GET    /                      -> all items (protected)
 *   GET    /:id                   -> one item (protected)
 *   POST   /                      -> create (admin, editor)
 *   PATCH  /:id                   -> update (admin, editor)
 *   DELETE /:id                   -> delete (admin)
 */
function buildResource(basePath, Model, options) {
  const ctrl = crudFactory(Model, options);
  const sub = express.Router();

  sub.get('/public', ctrl.listPublic);
  sub.get('/public/:slug', ctrl.getPublicBySlug);

  sub.get('/', protect, restrictTo('admin', 'editor', 'viewer'), ctrl.listAll);
  sub.get('/:id', protect, restrictTo('admin', 'editor', 'viewer'), ctrl.getOne);
  sub.post('/', protect, restrictTo('admin', 'editor'), ctrl.create);
  sub.patch('/:id', protect, restrictTo('admin', 'editor'), ctrl.update);
  sub.delete('/:id', protect, restrictTo('admin'), ctrl.remove);

  router.use(basePath, sub);
}

buildResource('/services', Service);
buildResource('/industries', Industry);
buildResource('/locations', Location, { publicFilter: { isPublished: true, isVerified: true } });
buildResource('/case-studies', CaseStudy, { publicFilter: { isPublished: true, customerPermissionGranted: true } });
buildResource('/insights', Insight, { publicFilter: { isPublished: true, editorialApprovalStatus: 'approved' } });
buildResource('/jobs', Job, { publicFilter: { isPublished: true, isOpen: true } });
buildResource('/pages', Page);
buildResource('/redirects', Redirect, { publicFilter: { isActive: true } });
buildResource('/documents', Document, { publicFilter: { isPublished: true, isApproved: true } });

module.exports = router;
