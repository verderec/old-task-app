$( document ).on("pagecreate", "#task-page", function() {


  var tasks = taskList(), // new tasklist instance - loads from localstorage

			/**
			 *  display a task
			 */
      displayTask = function displayTask (task, taskId) {
        $('#tasklist').append(
          [
            '<li data-icon="carat-r" id="', taskId, '">',
            '<a href="#">',
            '<h2>', task.name, '</h2>',
            '<p>', task.details, '</p>',
            '</a>',
            '<a href="#">',
            'Show',
            '</a>',
            '</li>'
          ].join('')
        );
        $('#tasklist').listview('refresh');
      },

			/**
			 * remove a task from the list, and remove it from
			 * the display
       */
      deleteTask = function deleteTask (event) {
				var taskItem = event.data,
            taskId = taskItem.attr("id");
        
        if (tasks.remove(taskId)) {
          taskItem.remove();
          $('#tasklist').listview('refresh');
        }
      },
			
		  /**
			 *  Handle the task submit button
			 *  Add a new task to the list, display it,
			 *  and clear the form fields
			 */
			createTask = function createTask (evemt) {
		    var task = {
							name: $('#taskname').val(),
				      details: $('#taskdetails').val()
						},
        		taskId = tasks.add(task);

        displayTask(task, taskId);

		    $( '#taskname' ).val('');
		    $( '#taskdetails' ).val('');
			},
			
			/**
			 *  setup the delete event handler after
			 *  a left swipe on a task
			 *
			 *  if there's an existing task awaiting
			 *  deletion, clear the delete button on
			 *  that task frst.
			 *
			 *  TODO: that could probably be done with
			 *        selectors rather than a variable
			 */
			setupDelete = function setupDelete (target) {
				var icon = target.children().last();
				
				// clear existing delete button
				if (taskAwaitingDeletion) {
					clearDelete(taskAwaitingDeletion);
				}

				// change the icon from > to X, use style C for red
				// background
				$(icon).attr('data-icon', 'delete')
		                     .addClass('ui-nodisc-icon ui-icon-delete ui-btn-c')
		                     .removeClass('ui-icon-carat-r');

				// register deleteTask as the click handler,
				// and pass in the LI element in event.data
				$(icon).on('click', null, target, deleteTask);

				// record which task has the delete button
				taskAwaitingDeletion = target;
			},
			
			/**
			 *  Clear the delete button from a target,
			 *  and remove deleteTask from the click handler
			 */
			clearDelete = function clearDelete (target) {
				var icon = target.children().last();

				if (taskAwaitingDeletion) {
					$(icon).attr('data-icon', 'carat-r')
			                     .removeClass('ui-nodisc-icon ui-icon-delete ui-btn-c')
			                     .addClass('ui-icon-carat-r');
				
					$(icon).off('click', deleteTask);
					taskAwaitingDeletion = null;
				}
			},
			
			// track which task has the delete button
			taskAwaitingDeletion = null;
  
  //
	// setup
	//
	

	// use left swipe to show the delete button on a task
	$('#tasklist').on("swipeleft", function (event) {

		// find the LI element that enclose the element
		// that received the swipe event
		var target = $(event.target).parentsUntil('', 'li');

		// set up the delete handler
		if (target && target.length === 1) {
			setupDelete(target);
			$('#tasklist').listview('refresh');
		}
	});

	// use left swipe to hide the delete button on a task
	$('#tasklist').on("swiperight", function (event) {

		// find the LI element that enclose the element
		// that received the swipe event
		var target = $(event.target).parentsUntil('', 'li');

		// set up the delete handler
		if (target && target.length === 1) {
			clearDelete(target);
			$('#tasklist').listview('refresh');
		}
	});

	// suppress Enter/Return in forms
  $("form :input").on("keypress", function(e) {
      return e.keyCode != 13;
  });

	// display any existing tasks (loaded from localstorage)
  tasks.forEach(displayTask);

	// register the event handler for creating tasks
  $("#add").on("click", createTask);

});
