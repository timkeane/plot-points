import $ from 'jquery'
import Source from 'ol/source/Vector'
import Layer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Papa from 'papaparse'
import Basemap from 'nyc-lib/nyc/ol/Basemap'
import LocationMgr from 'nyc-lib/nyc/ol/LocationMgr'
import Popup from 'nyc-lib/nyc/ol/FeaturePopup'
import CsvPoint from 'nyc-lib/nyc/ol/format/CsvPoint'
import AutoLoad from 'nyc-lib/nyc/ol/source/AutoLoad'
import style from './style'
import schema from './schema'

const geo_url = 'https://maps.nyc.gov/geoclient/v1/search.json?app_key=74DF5DB1D7320A9A2&app_id=nyc-lib-example'
const popupHtml = '<div class="feature"></div><div class="btns"><button class="move btn rad-all">Move</button><button class="save btn rad-all">Save</button><button class="delete btn rad-all">Delete</button><button class="cancel btn rad-all">Cancel</button></div>'
const boroSelect = '<select class="value"><option value="2">Bronx</option><option value="3">Brooklyn</option><option value="1">Manhattan</option><option value="4">Queens</option><option value="5">Staten Island</option>'

const map = new Basemap({target: 'map'})
const popup = new Popup({map, layers: []})
const locationMgr = new LocationMgr({map, url: geo_url})
const source = new Source()
const layer = new Layer({
  source, 
  style: style.location,
  zIndex: 20000
})

map.addLayer(layer)
locationMgr.mapLocator.layer.setStyle(style.geocode)

const getCsvUrl = () => {
  const search = document.location.search
  if (search && search.indexOf('csv=') > -1 && search.indexOf('=') === search.lastIndexOf('=')) {
    return decodeURIComponent(search.split('=')[1])
  }
}

const input = (props, prop) => {
  if (prop === 'boro') {
    return $(boroSelect).val(props.boro)
  } else {
    const input = $(`<input id="${prop}" class="value" value="${props[prop]}"></input>`)
    if (prop.toLowerCase().indexOf('date') > -1) {
      input.attr('type', 'date')
    } else if (prop.toLowerCase().indexOf('time') > -1) {
      input.attr('type', 'time')
    }
    return input
  }
}

const editFeature = (coordinate, feature) => {
  const props = feature.getProperties()
  const point = feature.getGeometry()
  feature.html = () => {
    const html = $(popupHtml)
    const props = feature.getProperties()
    Object.keys(props).forEach(prop => {
      if ($.inArray(prop, ['geometry', 'x', 'y']) === -1) {
        const nameValue = $('<div class="prop"></div>')
          .append(`<label for="${prop}" class="name">${prop}</span>`)
          .append(input(props, prop))
        html.first().append(nameValue)
      }
    })

    html.find('.save').click(() => {
      Object.keys(props).forEach(prop => {
        if (prop !== 'geometry') {
          feature.set(prop, $(`#${prop}`).val())
        }
      })
      if (feature._addme) {
        source.addFeature(feature)
        feature._addme = false
      }
      feature._moving_from = false
      popup.hide()
    })

    html.find('.delete').click(() => {
      if (!feature._addme) {
        source.removeFeature(feature)
      }
      popup.hide()
    })

    html.find('.move').click(event => {
      const move = $(event.target)
      move.toggleClass('pressed')
      feature._moving_from = move.hasClass('pressed') ? feature.getGeometry().getCoordinates() : false
    })

    html.find('.cancel').click(() => {
      popup.hide()
      if (feature._moving_from) {
        feature.setGeometry(new Point(feature._moving_from))
        feature._moving_from = false
      }
    })

    if (feature._moving_from) {
      html.find('.move').addClass('pressed')
    }

    return html
  }
  popup.feature = feature
  popup.showFeature(feature)
}

const getSchema = () => {
  const features = source.getFeatures()
  if (features.length > 0) {
    const result = {}
    const props = features[0].getProperties()
    Object.keys(props).forEach(prop => {
      if ($.inArray(prop, ['geometry', 'x', 'y']) === -1) {
        result[prop] = ''
      }
    })
    return result
  }
  return schema
}

map.on('click', event => {
  let feature = new Feature(getSchema())
  const point = new Point(event.coordinate)
  feature.setGeometry(point)
  feature._addme = true
  if ($(popup.element).find('.pop').is(':visible') && $('.move').hasClass('pressed')) {
    feature = popup.feature
    feature.setGeometry(point)
  } else {
    map.forEachFeatureAtPixel(event.pixel, (feat, lyr) => {
      if (lyr === layer) {
        feature = feat
      }
    })
  }
  editFeature(event.coordinate, feature)
})

let photo = false
$('.photo').click(() => {
  photo = !photo
  map[photo ? 'showPhoto' : 'hidePhoto']()
  $('.photo').html(photo ? 'Base Map' : 'Aerial Photo')
})

const format = new CsvPoint({
  x: 'x',
  y: 'y',
  dataProjection: 'EPSG:2263'
})
const loadCsv = url => {
  new AutoLoad({url, format})
    .autoLoad().then(features => {
      source.clear()
      source.addFeatures(features)
    })
}

$('.load-csv').click(() => {
  const csvUrl = getCsvUrl()
  if (csvUrl) {
    loadCsv(csvUrl)
  } else {
    const input = $('<input class="file-in" type="file">')
    const reader = new FileReader()
    reader.onload = () => {
      source.clear()
      source.addFeatures(format.readFeatures(reader.result))
    }
    $('body').append(input)
    input.change(event => {
      input.remove()
      reader.readAsText(event.target.files[0])
    })
    input.trigger('click')
  }
})

$('.save-csv').click(() => {
  const rows = []
  source.getFeatures().forEach(feature => {
    const coord = proj4('EPSG:3857', 'EPSG:2263', feature.getGeometry().getCoordinates())
    const row = {x: coord[0], y: coord[1]}
    const props = feature.getProperties()
    Object.keys(props).forEach(prop => {
      if ($.inArray(prop, ['geometry', 'x', 'y']) === -1) {
        row[prop] = props[prop]
      }
    })
    rows.push(row)
  })
  const csv = Papa.unparse(rows, {header: true})
  // this method say saveGeoJson but is just saving text - should add a saveText method
  map.storage.saveGeoJson('location.csv', csv)
})

global.map = map
global.source = source
global.layer = layer
global.popup = popup