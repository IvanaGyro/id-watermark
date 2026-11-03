import { defineTool } from '../types';

export default defineTool({
  slug: 'decibel-meter',
  name: 'Decibel Meter',
  seoTitle: 'Decibel Meter Online: Free Noise Level Meter and Scream Meter',
  description:
    'Free online decibel meter: use your phone or computer mic to check noise levels in dB(A), with min, average and max, a live 60-second graph and a scream meter.',
  category: 'test',
  icon: 'AudioLines',
  keywords: [
    'decibel meter',
    'decibel meter online',
    'noise level meter',
    'sound level meter',
    'db meter',
    'scream meter',
    'how loud is it',
    'noise meter app',
    'measure decibels with phone',
    'decibel test',
  ],
  intro:
    'Find out how loud it is around you with your phone or computer microphone: a live dB reading with min, average and max, a 60-second graph and a chart of everyday sounds. Then try the scream challenge.',
  howTo: [
    'Press “Start measuring” and allow microphone access when your browser asks.',
    'The big number in the gauge is the estimated level right now. Below it are the min, average (Leq), max and duration, plus a graph of the last 60 seconds. Press “Reset” to start the statistics over.',
    'If you have a real sound level meter, open “Settings and calibration”, enter its reading and press “Calibrate”. You can also switch between A-weighted and unweighted, and between Fast and Slow, there.',
    'To keep an eye on noise for a while, press “Full screen” and leave your phone on the desk. The screen stays on, upright or on its side.',
    'For the scream challenge, press “Start the challenge”, wait for the 3-2-1 countdown and shout for 3 seconds. Download the result card to share it.',
  ],
  sections: [
    {
      heading: 'What a decibel is, and why +10 dB sounds twice as loud',
      body: [
        'The decibel is a logarithmic unit. Sound pressure level is 20 × log10(p ÷ 20 µPa), where 20 micropascals is about the quietest 1 kHz tone a young listener can hear, so 0 dB means the threshold of hearing, not silence. Because the scale is logarithmic, every 10 dB step is 10 times the sound intensity (about 3.16 times the pressure), and 20 dB is 100 times the intensity.',
        'Perceived loudness is roughly logarithmic too: 10 dB more sounds about twice as loud. So 80 dB traffic carries 100 times the energy of a 60 dB conversation and sounds about four times as loud. Two more rules of thumb: two equally noisy machines together are only about 3 dB louder than one, and doubling your distance from a source in open space drops the level by about 6 dB.',
        'Most noise figures are A-weighted, written dB(A). Our ears are less sensitive to low and very high frequencies, so A-weighting cuts 100 Hz by about 19 dB and 50 Hz by about 30 dB. This meter uses a digital filter designed from the standard A-weighting curve, within 0.5 dB of it from 20 Hz to 10 kHz at the usual 44.1 or 48 kHz sample rates, and offers the two standard time weightings, Fast (125 ms) and Slow (1 s). The average is an energy average (Leq): half the time at 60 dB and half at 80 dB averages 77 dB, not 70 dB.',
      ],
    },
    {
      heading: 'How accurate is a phone or browser decibel meter?',
      body: [
        'A browser only sees the microphone’s digital signal, measured in dBFS (decibels relative to digital full scale). It has no idea how much air pressure that represents. Mic sensitivity differs between phones and laptops, and the system input volume, automatic gain control, noise suppression, the mic’s direction and even a phone case all shift the reading. Built-in mics also pick up very low and very high frequencies poorly. That is why this tool shows an estimate, dBFS plus a calibration offset, with 94 as a starting point.',
        'The meter asks the browser to turn off echo cancellation, noise suppression and automatic gain so loud sounds aren’t squashed, and tells you if the browser keeps any of them on. Very loud sounds can exceed what the mic and its converter can handle; the reading then stops climbing, and the scream challenge lets you know when that happens.',
        'To get close to a real instrument, calibrate against one. Put your phone next to a sound level meter set to A-weighting, aim both at the same steady sound such as a fan, and wait for the reading to settle. Then enter the meter’s value under “Settings and calibration” and press “Calibrate”: the tool uses the average of the last 3 seconds to set the offset. A calibration only holds for the same device, browser and input volume. Even calibrated, use it for everyday comparisons, not in place of a certified Class 1 or Class 2 sound level meter.',
      ],
    },
    {
      heading: 'Protecting your hearing',
      body: [
        'Hearing damage depends on both level and time. NIOSH in the US recommends limiting exposure to an average of 85 dB(A) over 8 hours and halving the time for every 3 dB more: about 4 hours at 88 dB, 2 hours at 91 dB, 1 hour at 94 dB and only 15 minutes at 100 dB.',
        'Ringing ears or muffled hearing after a concert are signs you had too much. Wear earplugs in loud places, keep away from speakers and take quiet breaks. With headphones, turn the volume down rather than drowning out background noise. If ringing or dull hearing doesn’t go away, see a doctor or an audiologist.',
        'The same goes for the scream challenge: never shout into someone’s ear, and stop if your throat hurts or your voice gets hoarse.',
      ],
    },
  ],
  faq: [
    {
      q: 'Can I use my phone as a decibel meter?',
      a: 'Yes, for a rough idea of how loud it is. Phone and laptop mics aren’t calibrated instruments, so uncalibrated readings can be well off. Calibrate once against a real meter for better numbers, and use a certified sound level meter for workplace safety or official noise measurements.',
    },
    {
      q: 'Why does it read differently from another app or meter?',
      a: 'Each app uses its own offset and may use A-weighting or none, Fast or Slow. Match the settings first (environmental noise is usually A-weighted), then use “Calibrate” to line it up with the meter you trust.',
    },
    {
      q: 'Should I use dB(A) or dB(Z)? Fast or Slow?',
      a: 'Use dB(A) for everyday noise and hearing protection. Switch to dB(Z) to see how strong low-frequency rumble is, such as an HVAC unit or a subwoofer. Use Fast for quick sounds like voices and shouts, and Slow for steady noise like traffic, where the number settles more.',
    },
    {
      q: 'How is the scream challenge scored?',
      a: 'After the countdown the meter listens for 3 seconds. Peak is the highest Fast-weighted level in that window, average is the energy average over it, and your rank comes from the peak. Your best score is saved only in this browser.',
    },
    {
      q: 'Does it work on iPhone?',
      a: 'Yes, in Safari or Chrome. Allow microphone access when asked. If the reading pauses after a call or after switching apps, press “Resume”. In-app browsers such as Instagram or Facebook often block the mic, so open the page in your regular browser.',
    },
    {
      q: 'Is my audio recorded or uploaded?',
      a: 'No. The page only computes the level in your browser. Nothing is recorded, saved or uploaded, and the result card is drawn on your device. The microphone turns off when you leave the page.',
    },
  ],
  related: ['mic-test', 'reaction-test', 'cps-test', 'screen-test', 'stopwatch'],
  priority: 50,
  updated: '2026-11-04',
});
