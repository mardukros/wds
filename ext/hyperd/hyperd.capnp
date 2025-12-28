using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public modules
    ( name = "hyperd:unified-integration", esModule = embed "unified-integration.js" ),
    
    # Internal modules
    ( name = "hyperd-internal:unified-integration-impl", esModule = embed "unified-integration-impl.js", internal = true ),
    ( name = "hyperd-internal:hyperd", esModule = embed "hyperd.js", internal = true ),
    ( name = "hyperd-internal:hgnn", esModule = embed "hgnn.js", internal = true ),
    
    # Binding module
    ( name = "hyperd:binding", esModule = embed "unified-integration-binding.js", internal = true ),
  ]
);
