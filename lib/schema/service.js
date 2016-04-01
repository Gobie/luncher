module.exports = {
  id: 'http://sbks-launcher.herokuapp.com/schema/service/response#',
  $schema: 'http://json-schema.org/draft-04/schema#',
  description: 'service response',
  type: 'object',
  properties: {
    menu: {
      type: 'array',
      items: {$ref: '#/definitions/menuDay'}
    }
  },
  required: ['menu'],
  additionalProperties: false,
  definitions: {
    menuDay: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
        items: {
          type: 'array',
          items: {$ref: '#/definitions/menuDayItem'}
        }
      },
      required: ['date', 'items'],
      additionalProperties: false
    },
    menuDayItem: {
      type: 'object',
      properties: {
        item: {
          type: 'string'
        },
        price: {
          type: 'string',
          pattern: '^\\d+\\s?Kč$'
        },
        amount: {
          type: 'string',
          pattern: '^\\d+\\s?(g|ks)'
        }
      },
      required: ['item', 'price', 'amout'],
      additionalProperties: false
    }
  }
}
