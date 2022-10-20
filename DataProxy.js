// Data object

let Data = () => {
    target = {
        subscribers: {},
        setters: {},
        subscribe: new Proxy(() => {}, {
            apply (target, thisArg, args) {
                if (thisArg[args[0]] === undefined) {
                    throw `DataError: Cannot subscribe to property ${args[0]}.`
                }
                thisArg.subscribers[args[0]].push(args[1]);
            }
        }),
        add: new Proxy(() => {}, {
            apply (target, thisArg, args) {
                const key = args[0];
                const value = args[1];
                const setter = args[2];
                if (thisArg[key] !== undefined) {
                    throw `DataError: Cannot add ${args[0]}, property already exists.)`
                }
                thisArg.subscribers[key] = [];
                thisArg.setters[key] = setter;
                thisArg[key] = {'__add__': value};
            }
        }),
    }

    handler = {
        get (target, prop, receiver) {
            return Reflect.get(...arguments);
        },
    
        set (target, prop, args) {
            if (target[prop] === undefined) {
                if (typeof args === 'object' && args.hasOwnProperty('__add__')) {
                    target[prop] = args.__add__;
                } else {
                    throw `DataError: Property ${prop} doesn't exist and cannot be set.`
                }
            } else {
                const value = target.setters[prop](args);
                target[prop] = value === undefined ? args : value;
                this.dispatch(...arguments);
                return;
            }
        },

        dispatch (target, prop, value) {
            for (let subscriber of target.subscribers[prop]) {
                subscriber(value);
            }
        }
    }
    return new Proxy(target, handler);
}

// create a new data proxy for data validation 
// and value change dispatches
let line = DataProxy();  

// add a data item (name, value, setter function)
line.add('width', 8, (value) => { return value; });  

// subscribe some functions to be called when data item changes
line.subscribe('width', (value) => console.log(`subscriber 1: ${value}`))  
line.subscribe('width', (value) => console.log(`subscriber 2: ${value}`))

// print out the value of the new data item
console.log(line.width);  // 100

// change the data item's value, dispatching the 
// value change to the subscribed functions
line.width = 10;

// print out the new value of the data item
console.log(line.width);  // 10
