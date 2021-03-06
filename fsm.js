//PURE LEADER EXPERT

var EVENTS = {
    's': 'satisfied',
    'f': 'forgives',
    'd': 'defects',
    'g': 'guilty',
    'p': 'punished',
    'u': 'failed to punish'
};

//Make into a constant to prevent modifications
Object.freeze(EVENTS);

var MESSAGES = [
    'Do as I say, or I\'ll punish you',
    'I accept your last proposal',
    'I don\t accept your last proposal',
    'That\s not fair',
    'I don\t trust you',
    'Excellent!',
    'Sweet. We are getting rich',
    'Give me another chance',
    'Okay. I forgive you',
    'I\'m changing my strategy',
    'We can both do better than this',
    'Curse you',
    'You betrayed me',
    'You will pay for this!',
    'In your face!',
    'Let\'s always play {0}',
    'This round\, let\'s play {0}',
    'Don\'t play {0}',
    'Let\'s alternate between {0} and {1}',
];

//Used by S0 to always transition to S1 and also S8
var CATCH_ALL_EVENT = 'ALL';

//Transition maps
var PURE_LEADER_TRANSITION_MAP = {
    'S0': {
        'ALL': {
            messageIds: [15],
            endState: 'S1'
        }
    },
    'S1': {
        'd': {
            randMessageIds: [11, 12],
            messageIds: [],
            endState: 'S2'
        },
        'g': {
            randMessageIds: [11, 12],
            messageIds: [13],
            endState: 'S7'
        },
        's': {
            messageIds: [5],
            endState: 'S2'
        }
    },
    'S2': {
        'd': {
            randMessageIds: [11, 12],
            messageIds: [],
            endState: 'S2'
        },
        'g': {
            randMessageIds: [11, 12],
            messageIds: [13],
            endState: 'S7'
        },
        's': {
            messageIds: [5],
            endState: 'S3'
        }
    },
    'S3': {
        'd': {
            randMessageIds: [11, 12],
            messageIds: [],
            endState: 'S2'
        },
        'g': {
            randMessageIds: [11, 12],
            messageIds: [13],
            endState: 'S7'
        },
        's': {
            messageIds: [5],
            endState: 'S4'
        }
    },
    'S4': {
        'd': {
            randMessageIds: [11, 12],
            messageIds: [],
            endState: 'S2'
        },
        'g': {
            randMessageIds: [11, 12],
            messageIds: [13],
            endState: 'S7'
        },
        's': {
            messageIds: [],
            endState: 'S5'
        }
    },
    'S5': {
        'd': {
            randMessageIds: [11, 12],
            messageIds: [],
            endState: 'S2'
        },
        'g': {
            randMessageIds: [11, 12],
            messageIds: [13],
            endState: 'S7'
        },
        's': {
            messageIds: [6],
            endState: 'S6'
        }
    },
    'S6': {
        'd': {
            randMessageIds: [11, 12],
            messageIds: [],
            endState: 'S2'
        },
        'g': {
            randMessageIds: [11, 12],
            messageIds: [13],
            endState: 'S7'
        },
        's': {
            messageIds: [],
            endState: 'S6'
        }
    },
    'S7': {
        'f': {
            messageIds: [14, 8],
            endState: 'S8'
        },
        'u': {
            messageIds: [],
            endState: 'S7'
        },
        'p': {
            messageIds: [14],
            endState: 'S7'
        }
    },
    'S8': {
        'ALL': {
            messageIds: [15],
            endState: 'S3'
        }
    }
};

function Transition(startState, endState, event, transitionMessage) {
    this.startState = startState;
    this.endState = endState;
    this.triggerEvent = event;
    this.message = transitionMessage;
}

Transition.prototype.getTransitionLog = function () {
    return 'State transition: ' +
        this.startState.name + ' -> ' + this.endState.name +
        ' with transition message: ' + this.message +
        ' was triggered by event ' + this.triggerEvent;
};

function State(stateName, transitionMap) {
    this.name = stateName;
    this.transitionMap = transitionMap;
}

State.prototype.getTransitionInfoForEvent = function (event) {
    var stateInfo = this.transitionMap[event] || this.transitionMap[CATCH_ALL_EVENT];
    if (!stateInfo) {
        throw new Error('Unknown event: ' + event + 'for state: ' + this.stateName);
    }

    return stateInfo;
}

function FSM(startStateName, transitionMap) {
    if (!startStateName) {
        throw new Error('Must specify a start state!');
    }

    this.transitionMap = transitionMap;
    Object.freeze(this.transitionMap);

    var startStateInfo = this.transitionMap[startStateName];
    var startState = new State(startStateName, startStateInfo);

    this.history = [];
    this.currentState = startState;
    this.currentMessage = '';
}

FSM.prototype.transition = function (event) {
    if (!EVENTS[event]) {
        throw new Error('Unknown event!: ' + event);
    }

    var transitionInfo = this.currentState.getTransitionInfoForEvent(event);
    var newStateName = transitionInfo.endState;
    var newStateTransitionInfo = this.transitionMap[newStateName];
    var newState = new State(newStateName, newStateTransitionInfo);

    this.currentMessage = this.getMessageForTransition(transitionInfo)
    var transition = new Transition(this.currentState, newState, event, this.currentMessage);
    this.currentState = newState;
    this.history.unshift(transition);
}

FSM.prototype.getMessageForTransition = function (transitionInfo) {
    var message = '';
    var messageIds = transitionInfo.messageIds;
    var randMessageIds = transitionInfo.randMessageIds;

    var randMessagesLen = randMessageIds && randMessageIds.length;
    if (randMessagesLen) {
        var selection = Math.floor(Math.random() * randMessagesLen);
        var randMessageId = randMessageIds[selection];
        message = MESSAGES[randMessageId] + ' ';; 
    }

    for (var i = 0, len = messageIds.length; i < len; i++) {
        var messageId = messageIds[i];
        var messageText = MESSAGES[messageId];
        message += messageText + ' ';
    }

    return message;
}

FSM.prototype.getHistory = function () {
    var logs = [];

    for (var i = 0, len = this.history.length; i < len; i++) {
        var transition = this.history[i];
        logs.unshift(transition.getTransitionLog());
    }

    return logs.join('\n');
}

var f = new FSM('S0', PURE_LEADER_TRANSITION_MAP);

//Trace out path S0-> S1-> S2 ->S7->S8->S3->S4->S2->S3
f.transition('f'); //S1
f.getHistory();
f.transition('d'); //S2
f.getHistory();
f.transition('g'); //S7
f.getHistory();
f.transition('f'); //S8
f.getHistory();
f.transition('g'); //S3
f.getHistory();
f.transition('s'); //S4
f.getHistory();
f.transition('d'); //S2
f.getHistory();
f.transition('s'); //S3
f.getHistory();
f.transition('gfdsafdafsad'); //Exception! Invalid event; still at S3
console.log(f.getHistory()); 
console.log(f.currentMessage);
console.log(f.currentState);