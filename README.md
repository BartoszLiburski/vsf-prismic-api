# Prismic Api Module

This API extension 
1. get data from prismic repository  
2. Saving this data to elastic search 
3. Listen to Prismic webhooks, on api change updates 3 lately published pages 
4. Provides methods to modify the Prismic content on return

# Installation
In your `config/local.json` file you should register the extension:
`"registeredExtensions": ["cms-prismic"],`

and also add your prismic API config: 
  `
  "prismic": {
    "apiEndpoint": "https://publicrepo.prismic.io/api/v2",
    "webhook": {
      "secretKey": "<< your secret >>"
    }
  }
  `

Make sure that you have installed `prismic-javascript` npm module 
`npm install prismic-javascript --save`

# GET /api/ext/cms-prismic/index/

**GET parameters** 
1. id - id from Prismic. 
`/api/ext/cms-prismic/index/?id=W1G4GxEAACIAdKrj` 
-> will search for document with id W1G4GxEAACIAdKrj

2. type - type from Prismic, type of document
`/api/ext/cms-prismic/index/?type=cms_page` 
-> will search for documents with type cms_page 
**NOTE**, if you want to use searching by `type` then first use `fetchAllAndSaveFromPrismic` method

3. tags - Prismic document tags, use with by `type` searching 

4. index_name - use if you have multiple indexes in ElasticSearch. By default module uses:
`vue_storefront_catalog` (from config, first of elasticsearch.indices)

5. filter - use filter with given name

6. filter_option - use with `filter`, passing parameter to filters 

**Example response**
```
{
  "code":200,
  "result":
  {
    "prismic_content":[{"image":{"dimensions":{"width":1920,"height":350},"alt":null ...
  }
}
```

# POST /api/ext/cms-prismic/webhook/
listens to Prismic webhooks.

To listen to Prismic webhooks:
1. set up webhook on your Prismic repo (Look on Prismic docs: [https://user-guides.prismic.io/webhooks/webhooks])
2. Use url: <your domain>/api/ext/cms-prismic/webhook/
3. Paste your secret token to config/local.json

