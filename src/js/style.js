import Style from 'ol/style/Style'
import RegularShape from 'ol/style/RegularShape'
import Stroke from 'ol/style/Stroke'

export default new Style({
  image: new RegularShape({
    stroke: new Stroke({width: 2}),
    points: 4,
    radius: 10,
    radius2: 0,
    angle: 0
  })
})
