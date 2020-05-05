import $ from 'jquery'
import Source from 'ol/source/Vector'
import Layer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Papa from 'papaparse'
import Basemap from 'nyc-lib/nyc/ol/Basemap'
import LocationMgr from 'nyc-lib/nyc/ol/LocationMgr'
import Popup from 'nyc-lib/nyc/ol/FeaturePopup'

const url = 'https://maps.nyc.gov/geoclient/v1/search.json?app_key=74DF5DB1D7320A9A2&app_id=nyc-lib-example'
const map = new Basemap({target: 'map'})
const locationMgr = new LocationMgr({map, url})

const source = new Source()
const layer = new Layer({source, zIndex: 20000})

map.addLayer(layer)

const popup = new Popup({map, layers: []})

const input = (props, prop) => {
  const input = $(`<input id="${prop}" class="value" value="${props[prop]}"></input>`)
  if (prop.indexOf('date') > -1) {
    input.attr('type', 'date') 
  }
  return input
}

const popupHtml = '<div class="feature"></div><div class="btns"><button class="save btn rad-all">Save</button><button class="cancel btn rad-all">Cancel</button></div>'

const editFeature = (coordinate, feature) => {
  const props = feature.getProperties()
  const point = feature.getGeometry()
  feature.html = () => {
    const html = $(popupHtml)
    const props = feature.getProperties()
    Object.keys(props).forEach(prop => {
      if (prop !== 'geometry') {
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
        feature._addme = false
        source.addFeature(feature)
      }
      popup.hide()
    })
    html.find('.cancel').click($.proxy(popup.hide, popup))
    return html
  }
  popup.showFeature(feature)
}

map.on('click', event => {
  let feature = new Feature({name: '', location: '', date1: '', time1: '', date2: '', time2: ''})
  feature.setGeometry(new Point(event.coordinate))
  feature._addme = true
  map.forEachFeatureAtPixel(event.pixel, (feat, lyr) => {
    if (lyr === layer) {
      feature = feat
    }
  })
  editFeature(event.coordinate, feature)
})

let photo = false
$('.photo').click(() => {
  photo = !photo
  map[photo ? 'showPhoto' : 'hidePhoto']()
  $('.photo').html(photo ? 'Base Map' : 'Aerial Photo')
})

$('.csv').click(() => {
  const rows = []
  source.getFeatures().forEach(feature => {
    const coord = proj4('EPSG:3857', 'EPSG:2263', feature.getGeometry().getCoordinates())
    const row = {x: coord[0], y: coord[1]}
    const props = feature.getProperties()
    Object.keys(props).forEach(prop => {
      if (prop !== 'geometry') {
        row[prop] = props[prop]
      }
    })
    rows.push(row)
  })
  const csv = Papa.unparse(rows, {header: true})
  console.warn('TODO: save this csv to a file')
  console.log(csv)
})

