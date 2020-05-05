import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

export default new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({color: 'rgba(128,61,141,.7)'}),
    stroke: new Stroke({width: 1, color: '#803D8D'})
  })
})
