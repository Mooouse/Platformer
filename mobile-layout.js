/**
 * Choose a native game-camera resolution that preserves square pixel-art pixels.
 * World objects stay in their original coordinates; portrait adds vertical
 * sky above the same ground instead of stretching a landscape screenshot.
 */
export function calculateGameViewport(cssWidth, cssHeight) {
  const width=Math.max(1,Number(cssWidth)||480);
  const height=Math.max(1,Number(cssHeight)||270);
  const aspect=width/height;
  const portrait=aspect<0.88;
  if(portrait){
    const gameWidth=220;
    const gameHeight=Math.max(270,Math.round(gameWidth/aspect));
    return {
      width:gameWidth,height:gameHeight,portrait:true,
      worldOffset:Math.max(0,gameHeight-285),
      cameraLead:0.40
    };
  }
  return {
    width:Math.min(820,Math.max(270,Math.round(270*aspect))),
    height:270,portrait:false,worldOffset:0,cameraLead:0.32
  };
}
