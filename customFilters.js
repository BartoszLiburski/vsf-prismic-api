const filters = {
  categoryImageSlide:(content, filterOption) => {
    let json = filters.jsonParse(content);
    for (let property in json.category_slide) {
      if(json.category_slide[property].category_id[0].text === filterOption) {
        return json.category_slide[property].image;
      }
    }
    return {};
  },
  jsonParse: (content) => {
    let json = content;
    if (typeof content === 'string') {
      json = JSON.parse(content);
    }
    return json;
  }
}

const filterReturnContent = (content, filter, filterOption) => {
  let contentToReturn = content;
  if (filter === 'category_slide' && filterOption) {
    contentToReturn = filters.categoryImageSlide(content, filterOption)
  }

  return filters.jsonParse(contentToReturn);
}

export { filterReturnContent };
