import { orDefault, arrUpdate, arrInsert, arrRemove } from "../util/index.js";
import { Stack } from "../collections/index.js";
export class LeafLayer {
    id;
    name;
    opacity;
    isHidden;
    static init(id) {
        return new LeafLayer(id, "", 1, false);
    }
    constructor(id, name, opacity, isHidden) {
        this.id = id;
        this.name = name;
        this.opacity = opacity;
        this.isHidden = isHidden;
    }
    get isLeaf() {
        return true;
    }
    with(args) {
        const name = orDefault(args.name, this.name);
        const opacity = orDefault(args.opacity, this.opacity);
        const isHidden = orDefault(args.isHidden, this.isHidden);
        return new LeafLayer(this.id, name, opacity, isHidden);
    }
}
export class GroupLayer {
    id;
    name;
    opacity;
    isHidden;
    children;
    static init(id) {
        return new GroupLayer(id, "", 1, false, []);
    }
    constructor(id, name, opacity, isHidden, children) {
        this.id = id;
        this.name = name;
        this.opacity = opacity;
        this.isHidden = isHidden;
        this.children = children;
    }
    get isLeaf() {
        return false;
    }
    with(args) {
        return new GroupLayer(this.id, orDefault(args.name, this.name), orDefault(args.opacity, this.opacity), orDefault(args.isHidden, this.isHidden), this.children);
    }
    withChildren(children) {
        return new GroupLayer(this.id, this.name, this.opacity, this.isHidden, children);
    }
    get(selectedPath) {
        const index = selectedPath.head;
        const selected = this.children[index];
        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf)
                throw new Error("Invariant violation");
            return selected.get(selectedPath.tail);
        }
        return selected;
    }
    getWithContext(selectedPath, opacity) {
        const index = selectedPath.head;
        const selected = this.children[index];
        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf)
                throw new Error("Invariant violation");
            return selected.getWithContext(selectedPath.tail, this.isHidden ? 0 : opacity * this.opacity);
        }
        return {
            id: selected.id,
            name: selected.name,
            opacity: selected.isHidden ? 0 : opacity * selected.opacity,
        };
    }
    findPath(id) {
        const children = this.children;
        for (let i = 0; i < this.children.length; i++) {
            const child = children[i];
            if (child.isLeaf) {
                if (child.id === id)
                    return Stack.empty().cons(i);
            }
            else {
                const path = child.findPath(id);
                if (path !== null)
                    return path.cons(i);
            }
        }
        return null;
    }
    insert(selectedPath, leaf) {
        const index = selectedPath.head;
        const selected = this.children[index];
        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf)
                throw new Error("Invariant violation");
            const newSelected = selected.insert(selectedPath.tail, leaf);
            const newChildren = arrUpdate(this.children, index, newSelected);
            return this.withChildren(newChildren);
        }
        else {
            return this.withChildren(arrInsert(this.children, index, leaf));
        }
    }
    remove(selectedPath) {
        const index = selectedPath.head;
        const selected = this.children[index];
        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf)
                throw new Error("Invariant violation");
            const [newSelected, newSelectedPath] = selected.remove(selectedPath.tail);
            const newChildren = arrUpdate(this.children, index, newSelected);
            return [this.withChildren(newChildren), newSelectedPath.cons(index)];
        }
        else {
            const newChildren = this.withChildren(arrRemove(this.children, index));
            if (newChildren.children.length === 0)
                return [newChildren, Stack.empty()];
            const newIndex = this.children.length === index + 1 ? index - 1 : index;
            const newSelectedPath = index === newIndex ? selectedPath : Stack.NonEmpty.of(newIndex);
            return [newChildren, newSelectedPath];
        }
    }
    update(selectedPath, updateFn) {
        const index = selectedPath.head;
        const selected = this.children[index];
        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf)
                throw new Error("Invariant violation");
            const newSelected = selected.update(selectedPath.tail, updateFn);
            const newChildren = arrUpdate(this.children, index, newSelected);
            return this.withChildren(newChildren);
        }
        else {
            const newSelected = updateFn(selected);
            const newChildren = arrUpdate(this.children, index, newSelected);
            return this.withChildren(newChildren);
        }
    }
    collectLeaves(array, opacity) {
        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            const layer = children[i];
            const nextOpacity = layer.isHidden ? 0 : opacity * layer.opacity;
            if (layer.isLeaf) {
                array.push({
                    id: layer.id,
                    name: layer.name,
                    opacity: nextOpacity,
                });
            }
            else {
                layer.collectLeaves(array, nextOpacity);
            }
        }
    }
}
export var MsgType;
(function (MsgType) {
    MsgType[MsgType["NewLayerMsg"] = 0] = "NewLayerMsg";
    MsgType[MsgType["RemoveMsg"] = 1] = "RemoveMsg";
    MsgType[MsgType["SelectMsg"] = 2] = "SelectMsg";
    MsgType[MsgType["SetOpacityMsg"] = 3] = "SetOpacityMsg";
    MsgType[MsgType["SetHiddenMsg"] = 4] = "SetHiddenMsg";
})(MsgType || (MsgType = {}));
class NewLayerMsg {
    id;
    type = MsgType.NewLayerMsg;
    constructor(id) {
        this.id = id;
    }
}
class RemoveMsg {
    id;
    type = MsgType.RemoveMsg;
    constructor(id) {
        this.id = id;
    }
}
class SelectMsg {
    id;
    type = MsgType.SelectMsg;
    constructor(id) {
        this.id = id;
    }
}
class SetOpacityMsg {
    id;
    opacity;
    type = MsgType.SetOpacityMsg;
    constructor(id, opacity) {
        this.id = id;
        this.opacity = opacity;
    }
}
class SetHiddenMsg {
    id;
    isHidden;
    type = MsgType.SetHiddenMsg;
    constructor(id, isHidden) {
        this.id = id;
        this.isHidden = isHidden;
    }
}
export class Sender {
    sendMessage;
    constructor(sendMessage) {
        this.sendMessage = sendMessage;
    }
    newLayer = (id) => {
        this.sendMessage(new NewLayerMsg(id));
    };
    removeLayer = (id) => {
        this.sendMessage(new RemoveMsg(id));
    };
    selectLayer = (id) => {
        this.sendMessage(new SelectMsg(id));
    };
    setOpacity = (id, opacity) => {
        this.sendMessage(new SetOpacityMsg(id, opacity));
    };
    setHidden = (id, isHidden) => {
        this.sendMessage(new SetHiddenMsg(id, isHidden));
    };
}
export class State {
    getNextLayerId;
    layers;
    selectedPath;
    static init() {
        const getNextLayerId = (() => {
            let layerId = 1;
            return () => layerId++;
        })();
        const leaf = LeafLayer.init(getNextLayerId());
        const group = GroupLayer.init(getNextLayerId()).withChildren([leaf]);
        return new State(getNextLayerId, group, Stack.empty().cons(0));
    }
    cachedSplitLayers = null;
    constructor(getNextLayerId, layers, selectedPath) {
        this.getNextLayerId = getNextLayerId;
        this.layers = layers;
        this.selectedPath = selectedPath;
    }
    current() {
        return this.layers.get(this.selectedPath);
    }
    update(msg) {
        switch (msg.type) {
            case MsgType.NewLayerMsg:
                return this.current().id === msg.id ? this.newLayer() : this;
            case MsgType.RemoveMsg:
                return this.current().id === msg.id ? this.removeCurrent() : this;
            case MsgType.SelectMsg:
                return this.current().id === msg.id ? this : this.select(msg.id);
            case MsgType.SetOpacityMsg: {
                const { id, opacity } = msg;
                const current = this.current();
                return current.id === id ? this.updateCurrent((x) => x.with({ opacity })) : this;
            }
            case MsgType.SetHiddenMsg: {
                const { id, isHidden } = msg;
                const current = this.current();
                return current.id === id ? this.updateCurrent((x) => x.with({ isHidden })) : this;
            }
            default: {
                const never = msg;
                throw { "unexpected msg": msg };
            }
        }
    }
    split() {
        if (this.cachedSplitLayers === null) {
            const children = this.layers.children;
            const selectedIdx = this.selectedPath.head;
            const above = [];
            const below = [];
            const baseOpacity = 1;
            for (let i = 0; i < selectedIdx; i++) {
                const child = children[i];
                if (!child.isLeaf) {
                    child.collectLeaves(above, baseOpacity);
                }
                else {
                    above.push({
                        id: child.id,
                        name: child.name,
                        opacity: baseOpacity * child.opacity,
                    });
                }
            }
            for (let i = this.selectedPath.head + 1; i < children.length; i++) {
                const child = children[i];
                if (!child.isLeaf) {
                    child.collectLeaves(below, baseOpacity);
                }
                else {
                    below.push({
                        id: child.id,
                        name: child.name,
                        opacity: baseOpacity * child.opacity,
                    });
                }
            }
            const current = this.layers.get(this.selectedPath);
            if (current.isLeaf) {
                this.cachedSplitLayers = {
                    above,
                    current: this.layers.getWithContext(this.selectedPath, baseOpacity),
                    below,
                };
            }
            else {
                current.collectLeaves(below, baseOpacity);
                this.cachedSplitLayers = { above, current: null, below };
            }
        }
        return this.cachedSplitLayers;
    }
    select(id) {
        const path = this.layers.findPath(id);
        if (path === null) {
            return this;
        }
        return new State(this.getNextLayerId, this.layers, path);
    }
    newLayer() {
        const layers = this.layers.insert(this.selectedPath, LeafLayer.init(this.getNextLayerId()));
        return new State(this.getNextLayerId, layers, this.selectedPath);
    }
    // newGroup(): LayerState {
    //     throw "todo"
    // }
    removeCurrent() {
        const [newLayers, newSelectedPath] = this.layers.remove(this.selectedPath);
        if (newSelectedPath.isNonEmpty()) {
            return new State(this.getNextLayerId, newLayers, newSelectedPath);
        }
        const oldIndex = this.selectedPath.head;
        const newIndex = newLayers.children.length <= oldIndex ? oldIndex : oldIndex - 1;
        return new State(this.getNextLayerId, newLayers, Stack.NonEmpty.of(newIndex));
    }
    updateCurrent(updateFn) {
        return new State(this.getNextLayerId, this.layers.update(this.selectedPath, updateFn), this.selectedPath);
    }
}
