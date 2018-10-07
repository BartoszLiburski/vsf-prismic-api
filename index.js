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
      console.log(response.results)
      apiStatus(res, response.results, 200);
    }, function (err) {
      console.log("Something went wrong: ", err);
    }).catch(err => {
      apiStatus(res, err, 500);
    });
  });

  return cmsApi;
}
