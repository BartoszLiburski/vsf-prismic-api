import { Router } from 'express';
import {apiStatus} from "../../../lib/util";
import { filterReturnContent } from './customFilters';
import { exists } from 'fs';
import constStrings from './constStrings';
const Prismic = require('prismic-javascript');
const elasticConnection = require('./elasticConnection');

module.exports = ({ config }) => {

  let cmsApi = Router();

  //listen to webhooks
  cmsApi.post('/webhook', (req, res) =>{
    if(req.body.root.secret === config.prismic.webhook.secretKey && config.prismic.useElasticSearchLayer) {
      if(req.body.root.type === 'api-update'){
        searchAndFetchFromPrismic(null, req).then( result => {
          let prismicRes = result.results;
          if(prismicRes.length > 0){
            elasticConnection.saveToElasticSearch(prismicRes);
            return apiStatus(res, true, 200);
          }
        }).catch(err => {
          throw new Error(constStrings.prismicFetchErrorThrow + err);
        })
      }
    }
    return apiStatus(res, false, 500);
  });

  cmsApi.get('/index', (req, res) => {
    let query
    if (req.query.id){
      query = { "_id": req.query.id };
    }
    else if (req.query.type){
      query = { "prismic_type": req.query.type }; //TODO: searching by type should ends with quering Prismic repo
      if (req.query.tags) {
        query['prismic_tags'] = req.query.tags;
      }
    } else {
      throw new Error(constStrings.elasticErrorThrow + 'No search data provided');
    }
    if(config.prismic.useElasticSearchLayer){
      elasticConnection.elasticSearchClient().search({
        index: elasticConnection.elasticSearchIndex(req.query.index_name),
        type: 'prismic',
        body: {
          query: {
            match: query
          },
        }
      },(error, response) => {
        if (error){
          throw new Error(constStrings.elasticErrorThrow + error);
        }
        if (response.hits.total === 0) { // need to get it from Prismic and save it to Elastic Search
          searchAndFetchFromPrismic(query, req)
            .then( result => {
              let prismicRes = result.results;
              if(prismicRes.length > 0){
                elasticConnection.saveToElasticSearch(prismicRes);
                return apiStatus(res, filterReturnContent(prismicRes[0].data, req.query.filter, req.query.filter_option), 200);
              }
              return apiStatus(res, 'No data with given properties in Prismic repo', 500);
            }).catch((err) => {
            throw new Error(constStrings.prismicFetchErrorThrow + err);
          })
        } else {
          return apiStatus(
            res,
            filterReturnContent(response.hits.hits[0]._source.content, req.query.filter, req.query.filter_option),
            200);
        }
      });
    } else {
      searchAndFetchFromPrismic(query, req).then( prismicRes => {
        if(prismicRes.results.length > 0){
          return apiStatus(res, filterReturnContent(prismicRes.results[0].data, req.query.filter, req.query.filter_option), 200);
        }
        return apiStatus(res, 'No data with given properties in Prismic repo', 500);
      }).catch((err) => {
        throw new Error(constStrings.prismicFetchErrorThrow + err);
      })
    }
  });

  const searchAndFetchFromPrismic = async (query, req, noLimit = false) => {
    let documentType = 'id';
    let byValue;
    let orderings;
    let prismicQuery;
    if(!query){
      prismicQuery = '';
      if (noLimit) {
        orderings = null;
      } else {
        orderings = { pageSize : 3, orderings : '[document.last_publication_date desc]' }; // get only recent content
      }
    } else {
      if(query.hasOwnProperty('_id')){
        byValue = query._id
      }
      if (query.hasOwnProperty('prismic_type')) {
        documentType = 'type';
        byValue = query.prismic_type
        if(query.hasOwnProperty('prismic_tag')){
          orderings = {orderings: query.prismic_tag }
        }
      }
      prismicQuery = Prismic.Predicates.at('document.' + documentType, byValue);
    }
    try {
      const api = await Prismic.getApi(config.prismic.apiEndpoint, { req: req });
      return await api.query(prismicQuery, orderings);
    }
    catch (err) {
      throw new Error(constStrings.prismicFetchErrorThrow + err);
    }
  };

  // TODO: snap this method to console command or smt
  // const fetchAllAndSaveFromPrismic = () => {
  //   searchAndFetchFromPrismic(null, null, true)
  //     .then( result => {
  //       let prismicRes = result.results;
  //       if(prismicRes.length > 0){
  //         saveToElasticSearch(prismicRes);
  //         return apiStatus(res, true, 200);
  //       }
  //       return apiStatus(res, 'No data in Prismic repo', 500);
  //     }).catch((err) => {
  //     throw new Error(constStrings.prismicFetchErrorThrow + err);
  //   })
  // }

  return cmsApi;
}
