using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module
    ( name = "nn-crm:nn-crm", esModule = embed "nn-crm.js" ),
    
    # Internal modules
    ( name = "nn-crm-internal:nn-crm-impl", esModule = embed "nn-crm-impl.js", internal = true ),
    ( name = "nn-crm-internal:crm-embeddings", esModule = embed "crm-embeddings.js", internal = true ),
    ( name = "nn-crm-internal:crm-network", esModule = embed "crm-network.js", internal = true ),
    
    # Binding module
    ( name = "nn-crm:binding", esModule = embed "nn-crm-binding.js", internal = true ),
  ]
);
