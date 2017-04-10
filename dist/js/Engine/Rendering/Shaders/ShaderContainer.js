import { DefaultBrushShader } from "./DefaultBrushShader";
import { DrawPointShader } from "./DrawPointShader";
import { SpriteShader } from "./SpriteShader";
import { OutputShader } from "./OutputShader";
import * as Settings from "../../Global/Settings";
export class ShaderContainer {
    constructor(renderer) {
        this._onSoftnessChanged = (value) => this.brushShader.softness = value;
        this._onGammaChanged = (value) => {
            this.outputShader.gamma = value;
            this.brushShader.gamma = value;
        };
        this._onCanvasWidthChanged = (value) => this.spriteShader.resolution = this.spriteShader.resolution.withX(value);
        this._onCanvasHeightChanged = (value) => this.spriteShader.resolution = this.spriteShader.resolution.withY(value);
        this.brushShader = new DefaultBrushShader(renderer, Settings.getValue(Settings.ID.BrushSoftness), Settings.getValue(Settings.ID.Gamma));
        this.drawPointShader = new DrawPointShader(renderer, null, Settings.getValue(Settings.ID.RenderingMaxDrawPoints));
        this.spriteShader = new SpriteShader(renderer);
        this.outputShader = new OutputShader(renderer, Settings.getValue(Settings.ID.Gamma));
        Settings.subscribe(Settings.ID.Gamma, this._onGammaChanged);
        Settings.subscribe(Settings.ID.BrushSoftness, this._onSoftnessChanged);
        Settings.subscribe(Settings.ID.CanvasWidth, this._onCanvasWidthChanged);
        Settings.subscribe(Settings.ID.CanvasHeight, this._onCanvasHeightChanged);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhZGVyQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJpbmcvU2hhZGVycy9TaGFkZXJDb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHOUMsT0FBTyxLQUFLLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQztBQUVsRCxNQUFNO0lBTUwsWUFBWSxRQUFrQjtRQWNwQix1QkFBa0IsR0FBRyxDQUFDLEtBQWEsS0FDNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBR3pCLG9CQUFlLEdBQUcsQ0FBQyxLQUFhO1lBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNoQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDaEMsQ0FBQyxDQUFBO1FBRVMsMEJBQXFCLEdBQUcsQ0FBQyxLQUFhLEtBQy9DLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVoRSwyQkFBc0IsR0FBRyxDQUFDLEtBQWEsS0FDaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBekJ6RSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksa0JBQWtCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQztRQUN6SSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQUNsSCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXJGLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzVELFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDdkUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN4RSxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzNFLENBQUM7Q0FrQkQifQ==