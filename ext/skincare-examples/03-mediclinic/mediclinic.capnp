using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module
    ( name = "mediclinic:mediclinic", esModule = embed "mediclinic.js" ),
    
    # Internal modules
    ( name = "mediclinic-internal:impl", esModule = embed "mediclinic-impl.js", internal = true ),
    
    # Binding module
    ( name = "mediclinic:binding", esModule = embed "mediclinic-binding.js", internal = true ),
  ]
);
