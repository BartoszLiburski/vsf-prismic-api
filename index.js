import { Router } from 'express';
import {apiStatus} from "../../../lib/util";
import config from 'config';
const Prismic = require('prismic-javascript');

module.exports = ({ config }) => {

  let cmsApi = Router();

  cmsApi.get('/cmsPrismic/:type/:orderings', (req, res) => {
    return Prismic.getApi(config.prismic.apiEndpoint, {req: req}).then(function (api) {
      return api.query(Prismic.Predicates.at('document.type', req.params.type),
        {orderings: `[$req.params.orderings]`});
    }).then(response => {
      apiStatus(res, response.results, 200);
    }, (err) => {
      console.log("Something went wrong: ", err);
    }).catch(err => {
      apiStatus(res, err, 500);
    });
  });
  cmsApi.get('/cmsPrismic/:id', (req, res) => {
    return Prismic.getApi(config.prismic.apiEndpoint, {req: req}).then(function (api) {
      return api.query(Prismic.Predicates.at('document.id', req.params.id));
    }).then(response => {
      apiStatus(res, response.results, 200);
    }, (err) => {
      console.log("Something went wrong: ", err);
    }).catch(err => {
      apiStatus(res, err, 500);
    });
  });

  return cmsApi;
}
