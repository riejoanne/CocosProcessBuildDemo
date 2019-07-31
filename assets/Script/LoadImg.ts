import CocosHelper from "./Helper/CocosHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadImage extends cc.Component {

    @property(cc.String)
    imageName: string = "";

    onLoad() {
        var self = this;
        cc.loader.loadRes(`${CocosHelper.getSceneName()}/${this.imageName}`, cc.SpriteFrame, function (err, spriteFrame) {
            self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    }
}
