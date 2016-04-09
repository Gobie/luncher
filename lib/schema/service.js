module.exports = {
  menu: {
    id: 'sbks-launcher/menu',
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
  },
  response: {
    id: 'sbks-launcher/response',
    type: 'array',
    items: {$ref: 'sbks-launcher/menu'},
    uniqueItems: true
  }
}
