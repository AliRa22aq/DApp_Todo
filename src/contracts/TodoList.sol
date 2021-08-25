pragma solidity ^0.5.0;

contract TodoList {
  uint public taskCount = 0;

  constructor() public {
      createTask("Hello World");
    }

  struct Task {
    uint id;
    string content;
    bool completed;
  }

  event TaskCreated(
    uint id,
    string content,
    bool completed
  );

  event ToggleCompleted(
    uint id,
    string content,
    bool completed
  );

  mapping(uint => Task) public tasks;

 function createTask(string memory _content) public {
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _content, false);
    emit TaskCreated(taskCount, _content, false);

  }

  function toggleCompleted(uint _id) public {

    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit ToggleCompleted(taskCount, _task.content, _task.completed);
}

}