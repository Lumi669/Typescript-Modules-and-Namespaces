export function Autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjustDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjustDescriptor;
}
//# sourceMappingURL=autobind.js.map