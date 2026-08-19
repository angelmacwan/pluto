# Ready for implimentation

- [x] update UI for node builder (custome node form)
      right now its a very crude rough design, there is no spaccing, maring, etc. buttons are all over the place. needs to be fixed to match rest of the app

- [x] i wanna be able to name the project. right now it uses a default name, when a new / old project opens , its name should be visible on the top nav bar and that should be editable

- [x] need a landing page

- [ ] i want a indicator that shows if there are unsaved changes, and when i hit the back button and changes are not saved, it prompts me to save or discard changes

- [ ] update loops
    - the way unreal enging handles loops, where loops take in a loop body, condition, and completed
    - input will be a loop variable (list, object, etc), there will be a condition (exit condition if we pass in a normal input like number, but if its a string, or list etc then we just loop over everythign)
    - there will be 2 outputs, loop body (the branch connected here will also be made from nodes and it becomes the actual loop body) and completed (the next block/node to execute once the loop is done)

- [ ] i want each project to have multiple pipelines
    - need a way to setup this in UI
    - firebase needs to adapt to this new id1ea

- [ ] python bridge
    - start with a python module at some point ill make it into a package, right now lets just make a module

---

# Upcoming work

- [ ] need a library of some pre defined workflows for people to start

- [ ] UI needs major overhall at some point, ill do that later

- [ ] make this into a python package like jupyter, so no firebase is needed, everything is local

- [ ] i am planning to remove firebase completly. This will be a python package that the user installs and simply runs it locally, the user can see their local files (only in the folder in which the pluto server is running). then they can create folders that live locally on their PC and easily manage projects / pipelines (like jupyter does). No more logings and stuff
