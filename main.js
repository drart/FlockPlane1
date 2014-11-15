var synth = flock.synth.polyphonic({
  synthDef : {
    id : "synthy",
    ugen : "flock.ugen.sinOsc",
    freq : 200,
    mul: {
                    id: "env",
                    ugen: "flock.ugen.env.simpleASR",
                    attack: 0.01,
                    sustain: 1.0,
                    release: 2.0
                },
  }
});

var synthvoice = {};

var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 3123
});

udpPort.on("open", function () {
    document.getElementById("message").innerText = "Listening for UDP on port " + udpPort.options.localPort;
});

udpPort.on("message", function(message){
  document.getElementById("message").innerText = fluid.prettyPrintJSON(message) ;


  if (message.args.length === 4){

    //synth.noteOn( message.address,{ "synthy.freq": mtof(message.args[3]) } );

    if(message.args[2] === 0){
      synthvoice[message.address] = true;
      synth.noteOff(message.address);
      return;
    }

    if (synthvoice[message.address] === true | synthvoice[message.address] === undefined ){
        synth.noteOn(message.address, {"synthy.freq": mtof(message.args[3])});
        //synth.noteOn(message.address, {"env.sustain": mtof(message.args[2])});
        synthvoice[message.address] = false;
        console.log("noteOn");
        return;
    }
    if (synthvoice[message.address] === false ){

        synth.noteChange(message.address, {"synthy.freq": mtof(message.args[3])});
        console.log(mtof(message.args[3]));
    }


      //console.log(synthvoice[message.address]);
  }
});

udpPort.on("error", function (err) {
    throw new Error(err);
});

function mtof(m){
  return Math.pow(2, (m - 69)/12 ) * 440;
};

udpPort.open();
synth.play();


