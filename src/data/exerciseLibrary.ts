import { Exercise } from '../types';

export const initialExercises: Exercise[] = [
  {
    id: 'ex_pushups',
    name: 'Push-Ups (or Incline/Knee Push-Ups)',
    category: 'Strength',
    difficulty: 'Beginner',
    targetArea: 'Chest, Shoulders, Triceps & Core',
    instructions: [
      'Place hands slightly wider than shoulder-width apart on the floor.',
      'Engage your core, keeping body straight from shoulders to heels (or knees).',
      'Lower your chest until your elbows bend to 90 degrees.',
      'Push firmly through palm heels back to starting position.'
    ],
    defaultReps: '10-12 reps',
    defaultSets: 3,
    defaultRestSeconds: 45,
    safetyGuidance: 'Keep spine neutral. Do not let your lower back sag or hips arch high.',
    equipmentNeeded: 'None (Bodyweight)',
    iconType: 'pushup'
  },
  {
    id: 'ex_squats',
    name: 'Bodyweight Air Squats',
    category: 'Strength',
    difficulty: 'Beginner',
    targetArea: 'Quadriceps, Glutes, Hamstrings & Calves',
    instructions: [
      'Stand with feet shoulder-width apart, toes pointing slightly outward.',
      'Inhale as you sit back and down as if sitting into a chair.',
      'Keep chest elevated and knees aligned over your toes.',
      'Drive through heels to extend knees and stand tall.'
    ],
    defaultReps: '15 reps',
    defaultSets: 3,
    defaultRestSeconds: 45,
    safetyGuidance: 'Avoid letting your knees cave inward. Keep weight evenly distributed.',
    equipmentNeeded: 'None (Bodyweight)',
    iconType: 'squat'
  },
  {
    id: 'ex_plank',
    name: 'Forearm Plank Hold',
    category: 'Core',
    difficulty: 'Beginner',
    targetArea: 'Transverse Abdominis, Obliques & Lower Back',
    instructions: [
      'Lie face down and prop yourself up on forearms and toes.',
      'Elbows should be directly beneath shoulders.',
      'Squeeze glutes and draw navel toward your spine to maintain a flat line.',
      'Hold steadily while breathing deeply.'
    ],
    defaultReps: '30-45 seconds hold',
    defaultSets: 3,
    defaultRestSeconds: 60,
    safetyGuidance: 'Stop if you feel sharpness in lower back. Elevate on knees if needed.',
    equipmentNeeded: 'Yoga Mat or Towel',
    iconType: 'plank'
  },
  {
    id: 'ex_jumping_jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    difficulty: 'Beginner',
    targetArea: 'Full Body Cardio & Calves',
    instructions: [
      'Stand upright with arms at sides and feet together.',
      'Jump feet out to the sides while sweeping arms above head.',
      'Land softly on balls of feet and jump back to starting position.',
      'Maintain a consistent, brisk rhythm.'
    ],
    defaultReps: '45 seconds work',
    defaultSets: 3,
    defaultRestSeconds: 30,
    safetyGuidance: 'Land softly on knees slightly bent to absorb impact.',
    equipmentNeeded: 'None',
    iconType: 'jumping'
  },
  {
    id: 'ex_lunges',
    name: 'Alternating Forward Lunges',
    category: 'Strength',
    difficulty: 'Intermediate',
    targetArea: 'Glutes, Quads & Balance',
    instructions: [
      'Stand tall with core engaged.',
      'Step forward with right foot, lowering hips until both knees bend at 90 degrees.',
      'Front knee should stay directly above ankles.',
      'Push back through front heel to starting stance and repeat on left side.'
    ],
    defaultReps: '12 reps per leg',
    defaultSets: 3,
    defaultRestSeconds: 45,
    safetyGuidance: 'Keep torso upright. Do not let trailing knee slam into floor.',
    equipmentNeeded: 'None',
    iconType: 'lunge'
  },
  {
    id: 'ex_mountain_climbers',
    name: 'Mountain Climbers',
    category: 'Cardio',
    difficulty: 'Intermediate',
    targetArea: 'Core, Shoulders & Cardio Stamina',
    instructions: [
      'Start in a high plank position with hands under shoulders.',
      'Drive right knee toward chest rapidly without lifting hips.',
      'Quickly switch legs, pulling left knee in while extending right leg.',
      'Continue alternating at a rapid pace.'
    ],
    defaultReps: '30-40 seconds',
    defaultSets: 3,
    defaultRestSeconds: 45,
    safetyGuidance: 'Keep hands firmly planted. Maintain plank hips height.',
    equipmentNeeded: 'None',
    iconType: 'run'
  },
  {
    id: 'ex_glute_bridges',
    name: 'Glute Bridges',
    category: 'Strength',
    difficulty: 'Beginner',
    targetArea: 'Glutes, Hamstrings & Lower Back',
    instructions: [
      'Lie on your back with knees bent and feet flat on floor, hip-width apart.',
      'Drive through heels to lift hips upward until knees, hips and shoulders align.',
      'Squeeze glutes tightly at the top for 2 seconds.',
      'Lower hips slowly back to touch mat.'
    ],
    defaultReps: '15 reps',
    defaultSets: 3,
    defaultRestSeconds: 30,
    safetyGuidance: 'Avoid over-arching lower back at peak extension.',
    equipmentNeeded: 'Exercise Mat',
    iconType: 'stretch'
  },
  {
    id: 'ex_cobra_stretch',
    name: 'Cobra / Sphinx Stretch',
    category: 'Flexibility',
    difficulty: 'Beginner',
    targetArea: 'Abs, Chest & Lower Back Extension',
    instructions: [
      'Lie face down on mat with palms beneath shoulders.',
      'Gently press into hands to lift upper chest off floor while keeping pelvis grounded.',
      'Draw shoulders away from ears and gaze gently ahead.',
      'Hold for 20-30 seconds taking deep nasal breaths.'
    ],
    defaultReps: '30 seconds hold',
    defaultSets: 2,
    defaultRestSeconds: 30,
    safetyGuidance: 'Do not overextend lumbar spine if you feel compression.',
    equipmentNeeded: 'Exercise Mat',
    iconType: 'stretch'
  },
  {
    id: 'ex_dumbbell_rows',
    name: 'Single-Arm Dumbbell Rows (or Water Bottle)',
    category: 'Strength',
    difficulty: 'Intermediate',
    targetArea: 'Lats, Rhomboids & Rear Delts',
    instructions: [
      'Place left knee and left hand on bench/chair for support with back flat.',
      'Hold weight in right hand with arm extended down.',
      'Pull elbow up toward hip, squeezing shoulder blade.',
      'Lower weight under control.'
    ],
    defaultReps: '12 reps per arm',
    defaultSets: 3,
    defaultRestSeconds: 45,
    safetyGuidance: 'Avoid twisting spine or jerking weight upward.',
    equipmentNeeded: 'Dumbbells or Water Bottles',
    iconType: 'dumbbell'
  },
  {
    id: 'ex_childs_pose',
    name: "Child's Pose Restorative Stretch",
    category: 'Mobility',
    difficulty: 'Beginner',
    targetArea: 'Hips, Thighs & Spine Decompression',
    instructions: [
      'Kneel on mat with big toes touching and knees spread wider than hips.',
      'Sit back onto heels and extend arms forward on floor.',
      'Rest forehead lightly on mat and relax shoulders.',
      'Breathe slowly into back of ribcage.'
    ],
    defaultReps: '45 seconds hold',
    defaultSets: 2,
    defaultRestSeconds: 20,
    safetyGuidance: 'Gentle passive stretch; modify knee spread if knee tension occurs.',
    equipmentNeeded: 'Exercise Mat',
    iconType: 'stretch'
  }
];
