"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZP = void 0;
// Common zoompan expressions
exports.ZP = {
    zoomIn: (dur, fps = 30) => `zoompan=z='min(zoom+0.002,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
    zoomOut: (dur, fps = 30) => `zoompan=z='if(eq(on,1),1.3,max(zoom-0.002,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
    slowZoomIn: (dur, fps = 30) => `zoompan=z='min(zoom+0.001,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
    panRight: (dur, fps = 30) => `zoompan=z='1.2':x='if(eq(on,1),0,min(x+2,iw-iw/zoom))':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
    panLeft: (dur, fps = 30) => `zoompan=z='1.2':x='if(eq(on,1),iw-iw/zoom,max(x-2,0))':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
    bounce: (dur, fps = 30) => `zoompan=z='1.1+0.05*sin(on*PI/${fps})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
    rotate: (dur, fps = 30) => `zoompan=z='1.15+0.05*sin(on*PI/${fps}/2)':x='iw/2-(iw/zoom/2)+10*sin(on*PI/${fps})':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
    fastZoom: (dur, fps = 30) => `zoompan=z='min(zoom+0.005,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * fps}:s=1080x1080:fps=${fps}`,
};
//# sourceMappingURL=base.js.map