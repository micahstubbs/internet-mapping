define(
  [
    'react',
    'react-dom',
    'jquery',
    'underscore',
    'cytoscape',
    'cytoscape-panzoom',
    'colors'
  ],
  function(React, ReactDOM, $, _, cytoscape, panzoom, Colors) {
    panzoom(cytoscape, $) // Register panzoom

    var CytoscapeGraph = React.createClass({
      const: {
        REFRESH_STYLE_PAUSE: 300, // ms
        MIN_EDGE_WIDTH: 0.15,
        MAX_EDGE_WIDTH: 0.25,
        NODE_SIZE: 2
      },

      componentDidMount: function() {
        var props = this.props,
          consts = this.const

        var cs = (this._csGraph = cytoscape({
          container: ReactDOM.findDOMNode(this),
          layout: {
            name: 'preset',
            fit: false
          },
          minZoom: 1,
          maxZoom: 100,
          autoungrabify: true,
          autolock: true,
          hideEdgesOnViewport: true,
          hideLabelsOnViewport: true,
          textureOnViewport: true,
          motionBlur: true,
          style: [
            {
              selector: 'node',
              style: {
                width: this.const.NODE_SIZE,
                height: this.const.NODE_SIZE,
                'border-width': this.const.NODE_SIZE * 0.1,
                'border-color': 'orange',
                'background-color': 'yellow',
                'background-opacity': 0.3
              }
            },
            {
              selector: 'edge',
              style: {
                'curve-style': 'haystack', // 'bezier'
                width: 0.05,
                opacity: function(el) {
                  return el.data('opacity')
                },
                'line-color': function(el) {
                  return el.data('color')
                }
              }
            }
          ],
          elements: {
            nodes: props.nodes.map(function(node) {
              return {
                data: $.extend({ id: node.id }, node.nodeData),
                position: {
                  x: node.x,
                  y: node.y
                }
              }
            }),
            edges: props.edges.map(function(edge) {
              return {
                data: {
                  source: edge.src,
                  target: edge.dst,
                  color: edge.color || 'lightgrey',
                  opacity: edge.opacity || 1
                }
              }
            })
          }
        })
          .on('zoom', function() {
            adjustElementSizes()
            zoomOrPan()
          })
          .on('pan', zoomOrPan)
          .on('mouseover', 'node', function() {
            props.onNodeHover(this.data())
          })
          .on('select', 'node', function() {
            props.onNodeClick(this.data())
          }))

        cs.panzoom({
          zoomFactor: 0.1, // zoom factor per zoom tick
          zoomDelay: 50, // how many ms between zoom ticks
          minZoom: 1, // min zoom level
          maxZoom: 100, // max zoom level
          fitPadding: 0, // padding when fitting
          panSpeed: 20, // how many ms in between pan ticks
          panDistance: 40 // max pan distance per tick
        })

        function zoomOrPan() {
          var pan = cs.pan()
          props.onZoomOrPan(cs.zoom(), pan.x, pan.y)
        }

        var adjustElementSizes = _.debounce(
          this.resetStyle,
          consts.REFRESH_STYLE_PAUSE
        )
      },

      render: function() {
        return (
          <div
            style={{
              width: this.props.width,
              height: this.props.height
            }}
          />
        )
      },

      zoom: function(ratio) {
        this._csGraph.zoom(ratio)
      },

      pan: function(x, y) {
        this._csGraph.pan({ x: x, y: y })
      },

      getNodeById: function(id) {
        return this._csGraph.getElementById(id)
      },

      resetStyle: function() {
        var cs = this._csGraph,
          zoom = cs.zoom(),
          nodeSize = this.const.NODE_SIZE / zoom
        cs
          .style()
          .selector('node')
          .style({
            width: nodeSize,
            height: nodeSize,
            'background-color': 'yellow',
            'background-opacity': 0.3
          })
          .selector('edge')
          .style({
            width:
              Math.min(
                this.const.MIN_EDGE_WIDTH * zoom,
                this.const.MAX_EDGE_WIDTH
              ) / zoom
          })
          .update()
      }
    })

    return React.createClass({
      getDefaultProps: function() {
        return {
          graphData: graphRandomGenerator(5, 10),
          width: window.innerWidth,
          height: window.innerHeight,
          margin: 0,
          selectedAs: null
        }
      },

      getInitialState: function() {
        return {
          radialNodes: this._genRadialNodes(),
          edges: this._getEdges()
        }
      },

      componentDidMount: function() {
        this.refs.radialGraph.zoom(1)
        this.refs.radialGraph.pan(this.props.width / 2, this.props.height / 2)
      },

      componentWillReceiveProps: function(nextProps) {
        if (
          nextProps.width !== this.props.width ||
          nextProps.height !== this.props.height ||
          nextProps.graphData !== this.props.graphData
        ) {
          this.setState({ radialNodes: this._genRadialNodes() })
        }
      },

      render: function() {
        return (
          <CytoscapeGraph
            ref="radialGraph"
            nodes={this.state.radialNodes}
            edges={this.state.edges}
            width={this.props.width}
            height={this.props.height}
            onZoomOrPan={this._onZoomOrPan}
            onNodeHover={this.props.onAsHover}
            onNodeClick={this.props.onAsClick}
          />
        )
      },

      _genRadialNodes: function() {
        var rThis = this
        var maxR =
          Math.min(this.props.width, this.props.height) / 2 - this.props.margin

        var maxConeSize = Math.max.apply(
          null,
          this.props.graphData.ases.map(function(asNode) {
            return asNode.customerConeSize
          })
        )

        return this.props.graphData.ases.map(function(node) {
          var radius = rThis._getRadius(node.customerConeSize, maxConeSize)
          return {
            // Convert to radial coords
            id: node.asn,
            x: maxR * radius * Math.cos(-node.lon * Math.PI / 180),
            y: maxR * radius * Math.sin(-node.lon * Math.PI / 180),
            nodeData: node
          }
        })
      },

      _getEdges: function() {
        var customerCones = {}
        var maxConeSize = Math.max.apply(
          null,
          this.props.graphData.ases.map(function(asNode) {
            customerCones[asNode.asn] = asNode.customerConeSize
            return asNode.customerConeSize
          })
        )

        return this.props.graphData.relationships.map(function(rel) {
          if (!rel.hasOwnProperty('customerConeSize')) {
            rel.customerConeSize = Math.min(
              customerCones[rel.src],
              customerCones[rel.dst]
            )
          }
          return {
            src: rel.src,
            dst: rel.dst,
            color: Colors.valueRgb(rel.customerConeSize, maxConeSize),
            opacity: Colors.valueOpacity(rel.customerConeSize, maxConeSize)
          }
        })
      },

      _getRadius: function(coneSize, maxConeSize) {
        // 0<=result<=1
        return (
          (Math.log(maxConeSize) - Math.log(coneSize)) /
            (Math.log(maxConeSize) - Math.log(1)) *
            0.99 +
          0.01
        )
      },

      _onZoomOrPan: function(zoom, panX, panY) {
        var r = Math.min(this.props.width, this.props.height) / 2,
          offsetX = -(panX - this.props.width / 2) / zoom / r,
          offsetY = -(panY - this.props.height / 2) / zoom / r,
          offsetR = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
          offsetAng = offsetR
            ? -Math.acos(offsetX / offsetR) / Math.PI * 180
            : 0,
          zoomRadius = 1 / zoom

        if (offsetY < 0) {
          // Complementary angle
          offsetAng = 360 - offsetAng
        }

        this.props.onRadialViewportChange(zoomRadius, offsetR, offsetAng)
      }
    })
  }
)

////

function graphRandomGenerator(nNodes, nEdges) {
  var nodes = [],
    edges = []

  nNodes = Math.max(nNodes, 1)
  nEdges = Math.abs(nEdges)

  while (nEdges--) {
    edges.push({
      src: Math.round((nNodes - 1) * Math.random()),
      dst: Math.round((nNodes - 1) * Math.random()),
      type: 'peer'
    })
  }
  while (nNodes--) {
    nodes.push({
      asn: nNodes,
      customerConeSize: Math.random(),
      lat: Math.random() * 180 - 90,
      lon: Math.random() * 360 - 180
      //x: Math.random(),
      //y: Math.random()
    })
  }

  return {
    ases: nodes,
    relationships: edges
  }
}
