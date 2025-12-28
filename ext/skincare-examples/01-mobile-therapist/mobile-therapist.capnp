using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module
    ( name = "mobile-therapist:mobile-therapist", esModule = embed "mobile-therapist.js" ),
    
    # Internal modules
    ( name = "mobile-therapist-internal:impl", esModule = embed "mobile-therapist-impl.js", internal = true ),
    
    # Binding module
    ( name = "mobile-therapist:binding", esModule = embed "mobile-therapist-binding.js", internal = true ),
  ]
);
