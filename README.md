# Prismic Api Module

This API extension get data from prismic repository  

In your `local.json` file you should register the extension:
`"registeredExtensions": ["cms-prismic"],`

and also add your prismic API endpoint: 

  `"prismic": {
    "apiEndpoint": "https://publicrepo.prismic.io/api/v2"
  }`

Make sure that you have installed `prismic-javascript` npm module 
`npm install prismic-javascript --save`

The API endpoitns are:
```
/api/ext/cms-data/cmsPrismic/:type/:orderings
```

