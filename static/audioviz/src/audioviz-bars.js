function audiovizBars(obj) {
	var t = this;
	
	t.element = obj.element;
	t.sound_path = obj.audioPath;
	t.w = document.getElementById(t.element).clientWidth;
	t.h = document.getElementById(t.element).clientHeight;
	t.total_bars = obj.totalBars || 16;                          
	t.background_color = obj.backgroundColor || "#231f20";        
	t.bars_color = obj.barsColor || "#f0ad00";
	t.gap = obj.gapSize || 5;       
	t.sampleSize = 2048;
	t.sourceNodes = [];
	t.sounds = [];
	t.current_index = 0;
	t.is_loaded = false;
	

	t.getBarHeight = function(h) {
		var bar_height = 0;

		for (var i = 0; i < h; i += 256) {
			bar_height += 1;
		}
		return bar_height;
	} ;

	t.update = function() {
		var frequencyData = new Uint8Array(t.analyser.frequencyBinCount);
		t.analyser.getByteFrequencyData(frequencyData);
		t.drawFrame(frequencyData);
		requestAnimationFrame(t.update);
	};

	t.drawFrame = function(heights) {
		t.ctx.fillStyle = t.background_color;
		t.ctx.fillRect(0,0,t.w,t.h);
		t.ctx.fillStyle = t.bars_color;
		var rx = 0;
		for (var i in heights) {
			var rw = t.bar_width;
			var rh = heights[i] * t.bar_height;
			var ry = t.h - rh;
			if ( i > 0 ) {
				rx += t.gap;
			}
			t.ctx.fillRect(rx, ry, rw, rh);
			rx += rw;
		}
	};
	
	t.loadAudio = function() {
		
		t.sounds.push(new Audio(t.sound_path));
		t.sounds[0].addEventListener('canplaythrough', function() { 
		   t.setup();
		}, false);
		
		t.sounds[0].addEventListener('error', function failed(e) {
		   switch (e.target.error.code) {
			 case e.target.error.MEDIA_ERR_ABORTED:
			   alert('You aborted the video playback.');
			   break;
			 case e.target.error.MEDIA_ERR_NETWORK:
			   alert('A network error caused the audio download to fail.');
			   break;
			 case e.target.error.MEDIA_ERR_DECODE:
			   alert('The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.');
			   break;
			 case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
			   alert('The video audio not be loaded, either because the server or network failed or because the format is not supported.');
			   break;
			 default:
			   alert('An unknown error occurred.');
			   break;
		   }
		}, true);
	}
	
	t.loadCanvas = function() {
		t.canvas = document.createElement('canvas');
	}

	t.changeTrack = function(audio_path) {
		t.sounds[t.current_index].pause();

		t.current_index++;
		t.sounds.push(new Audio(audio_path));
		t.sourceNodes.push(t.audioCtx.createMediaElementSource(t.sounds[t.current_index]));
		
		t.sounds[t.current_index].addEventListener('canplaythrough', function() { 
			t.sourceNodes[t.current_index].connect(t.analyser);
			t.sounds[t.current_index].play();
		}, false);
		
		t.sounds[t.current_index].addEventListener('error', function failed(e) {
		   switch (e.target.error.code) {
			 case e.target.error.MEDIA_ERR_ABORTED:
			   alert('You aborted the video playback.');
			   break;
			 case e.target.error.MEDIA_ERR_NETWORK:
			   alert('A network error caused the audio download to fail.');
			   break;
			 case e.target.error.MEDIA_ERR_DECODE:
			   alert('The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.');
			   break;
			 case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
			   alert('The video audio not be loaded, either because the server or network failed or because the format is not supported.');
			   break;
			 default:
			   alert('An unknown error occurred.');
			   break;
		   }
		}, true);
	}
	
	t.setup = function() {
		t.bar_width = (t.w/t.total_bars) - (t.gap * (t.total_bars-1) / t.total_bars);
		t.bar_height = t.getBarHeight(t.h);
		
		t.canvas.width = t.w;
		t.canvas.height = t.h;
		document.getElementById(t.element).appendChild(t.canvas);
		t.ctx = t.canvas.getContext('2d');

		t.audioCtx = new(window.AudioContext || window.webkitAudioContext);

		t.sourceNodes.push(t.audioCtx.createMediaElementSource(t.sounds[0]));
		t.analyser = t.audioCtx.createAnalyser();
		t.analyser.fftSize = t.total_bars * 2;
		t.analyser.smoothingTimeConstant = 0.75;
		
		t.sounds[0].play();
		t.sourceNodes[0].connect(t.analyser);
		t.analyser.connect(t.audioCtx.destination);
		t.is_loaded = true;
		t.update();
	};
	
	t.init = function() {
		t.loadCanvas();
		t.loadAudio();
	}

	if (!t.is_loaded) {
		t.init();
	}
}