import RunningTransition from "./running-transition";
import DSL from "./dsl";
import Ember from "ember";
import { Action } from "./rules";
import internalRules from "./internal-rules";

/*
  Working on a new constraint-based rules implementation:

  - keep a flat set of rules instead of the current nested thing.
  - filter it by the constraints, running the cheapest ones first.
  - choose from among the rules that match based on most-specific wins

  This should end up much simpler. No backtracking, no
  order-dependency, easier to implement wildcards that don't override
  more-specific rules.

  Add nice debug logging capability while we go. Make the rules
  themselves know how to print themselves back out with helpful
  annotations.

  Constraints:

    - each of these with string, regex, and predicate versions
      - fromRoute
      - toRoute
      - withinRoute
      - fromValue (possibly keep fromModel as an alias)
      - toVaue
    - isSelector (generalized hasClass, maybe keep hasClass too)
    - childOf (I think this may also just be a special case of isSelector)
    - helperName

  Priority

    - more total constraints matched wins (shorthands like withinRoute
      count as two constraints)

    - ties broken like isSelector > toValue > fromValue > toRoute > fromRoute

*/



var TransitionMap = Ember.Object.extend({
  init: function() {
    this.activeCount = 0;
    this.rules = [];
    this.map(internalRules);
    var config = this.container.lookupFactory('transitions:main');
    if (config) {
      this.map(config);
    }
    if (Ember.testing) {
      this._registerWaiter();
    }
  },

  runningTransitions: function() {
    return this.activeCount;
  },

  lookup: function(transitionName) {
    var handler = this.container.lookupFactory('transition:' + transitionName);
    if (!handler) {
      throw new Error("unknown transition name: " + transitionName);
    }
    return handler;
  },

  defaultAction: function() {
    if (!this._defaultAction) {
      this._defaultAction = new Action(this.lookup('default'), []);
    }
    return this._defaultAction;
  },

  transitionFor: function(conditions) {
    var rule = this.rules[this.rules.length-1];
    return new RunningTransition(this, conditions.versions,
                                 rule ? rule.use : this.defaultAction());
  },


  map: function(handler) {
    if (handler){
      handler.apply(new DSL(this));
    }
    return this;
  },

  addRule: function(rule) {
    rule.validate(this);
    this.rules.push(rule);
  }

});


TransitionMap.reopenClass({
  map: function(handler) {
    var t = TransitionMap.create();
    t.map(handler);
    return t;
  }
});

export default TransitionMap;