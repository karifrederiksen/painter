export class RenderingCoordinator {
    constructor(renderCallback) {
        this._requestId = -1;
        this._render = () => {
            this._renderCallback();
            this._requestId = -1;
        };
        console.assert(renderCallback != null, `RenderCallback is ${renderCallback}`);
        this._renderCallback = renderCallback;
    }
    requestRender() {
        if (this._requestId === -1) {
            this._requestId = requestAnimationFrame(this._render);
        }
    }
    forceRender() {
        if (this._requestId >= 0) {
            cancelAnimationFrame(this._requestId);
        }
        this._render();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVuZGVyaW5nQ29vcmRpbmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvRW5naW5lL1JlbmRlcmluZy9SZW5kZXJpbmdDb29yZGluYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxNQUFNO0lBSUwsWUFBWSxjQUF5QjtRQUYzQixlQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFzQmhCLFlBQU8sR0FBRztZQUNuQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUE7UUF0QkEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLElBQUksSUFBSSxFQUFFLHFCQUFxQixjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxhQUFhO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELENBQUM7SUFDRixDQUFDO0lBRU0sV0FBVztRQUVqQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDaEIsQ0FBQztDQU9EIn0=