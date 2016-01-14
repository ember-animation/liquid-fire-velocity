// supply an animate function to liquid-fire-core

export default {
  name: 'liquid-fire-velocity',

  initialize: function(registry) {
    registry.lookup('service:liquid-fire-transitions').animate = Ember.$.Velocity;
  }
};
