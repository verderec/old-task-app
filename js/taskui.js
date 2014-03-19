$( document ).on( "mobileinit", function () {
  
  // initialize the app by creating (and loading, if it exists)
  // the taskApp, and getting the first taskList (or creating a
  // new taskList if the collection is empty)
  var app = taskApp(),
      taskList = app.getAll()[0] || app.add(),

			/**
			 * displayTask - add a task to the task display
       *
       * @param {Object} task - a task Object
			 */
      displayTask = function displayTask (task) {
        $('#tasks-list').append(
          [
            '<li data-icon="carat-r" id="', task.id, '">',
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
        $('#tasks-list').listview('refresh');
      },

			/**
			 * displayTaskList - add a taskList to the taskList display
       *
       * @param {Object} taskList - a taskList Object
			 */
      displayTaskList = function displayTaskList (taskList) {
        $('#lists-list').append(
          [
            '<li id="', taskList.getId(), '">',
            '<a href="#">',
            '<h2>', taskList.getName(), '</h2>',
            '<p>', taskList.getDescription(), '</p>',
            '<span class="ui-li-count">',
            taskList.getAll().length,
            '</span>',
            '</a>',
            '</li>'
          ].join('')
        );
        $('#lists-list').listview('refresh');
      },
      
      /**
       * deleteTaskList - delete a taskList from the display
       *                  and the collection of taskLists
       */
      deleteTaskList = function deleteTaskList (event) {
        var taskListItem = event.data,
            taskListId = taskListItem.attr("id");

        event.preventDefault();
        
        if (app.remove(taskListId)) {
          taskListItem.remove();
          $('#lists-list').listview('refresh');
        }
      },

		  /**
			 *  Handle the task list submit button
			 *  Add a new tasklist to the list, display it,
			 *  and clear the form fields
			 */
			createTaskList = function createTaskList (event) {
		    var list = {}, taskList;

        event.preventDefault();

        list.name = $('#list-name').val().trim();
        list.description = $('#list-desc').val().trim();
        
        $( "#add-list" ).popup("close");
        if (list.name === '') {
          setTimeout(function () {
            $('#no-task-list-name').popup('open');
          }, 100);
        } else {
          taskList = app.add(list);
  		    $( '#list-name' ).val('');
  		    $( '#list-desc' ).val('');
          displayTaskList(taskList);
          $('#lists-list').listview("refresh");
        }
			},
			
			/**
			 * remove a task from the list, and remove it from
			 * the display
       */
      deleteTask = function deleteTask (event) {
				var taskItem = event.data,
            taskId = taskItem.attr("id");
        
        event.preventDefault();

        if (taskList.remove(taskId)) {
          taskItem.remove();
          $('#tasks-list').listview('refresh');
        }
      },
			
		  /**
			 *  Handle the task submit button
			 *  Add a new task to the list, display it,
			 *  and clear the form fields
			 */
			createTask = function createTask (event) {
		    var item = {}, taskId, task;

        event.preventDefault();

        item.name = $('#task-name').val().trim();
				item.details = $('#task-details').val().trim();

        $( "#add-task" ).popup("close");
        if (item.name === '') {
          setTimeout(function () {
            $('#no-task-name').popup('open');
          }, 100);
        } else {
          taskId = taskList.add(item);
          task = taskList.get(taskId);
  		    $( '#task-name' ).val('');
  		    $( '#task-details' ).val('');
          displayTask(task);
          $('#tasks-list').listview("refresh");
        }
			},
			
      /**
       * setupSwipes - setup swipe to delete controls on a listview
       *
       * @param {Object} listElement - the listElement to augment
       * @param {Function} deleteFn - the function to call to delete a list item
       */
      setupSwipes = function setupSwipes (listElement, deleteFn) {
        var
          /**
    			 *  setup the delete event handler after
    			 *  a left swipe on a task or taskList
    			 *
    			 *  if there's an existing item awaiting
    			 *  deletion, clear the delete button on
    			 *  that item frst.
    			 */
    			setupDelete = function setupDelete (target, deleteFn) {
    				var icon = target.children().last();
				
    				// clear existing delete button(s)
            $(listElement).children("[data-icon='delete']").each(function (idx, el) {
              clearDelete(el);
            })

    				// change the icon from > to X, use style C for red
    				// background, register deleteTask as the click handler,
    				// and pass in the LI element in event.data
    				$(icon).attr('data-icon', 'delete')
    		                     .addClass('ui-nodisc-icon ui-icon-delete ui-btn-c')
    		                     .removeClass('ui-icon-carat-r')
                     		     .on('click', null, target, deleteFn);

    				// register deleteTask as the click handler,
    				// and pass in the LI element in event.data
    				$(icon).on('click', null, target, deleteFn);

    			},
			
    			/**
    			 *  Clear the delete button from a target,
    			 *  and remove deleteTask from the click handler
    			 */
    			clearDelete = function clearDelete (target) {
    				var icon = target.children().last();

  					$(icon).attr('data-icon', 'carat-r')
  			                     .removeClass('ui-nodisc-icon ui-icon-delete ui-btn-c')
  			                     .addClass('ui-icon-carat-r')
                             .off('click', deleteTask);
    			};
      
      	// use left swipe to show the delete button on a task
      	$(listElement).on("swipeleft", function (event) {
      		// find the LI element that enclose the element
      		// that received the swipe event
      		var target = $(event.target).parentsUntil('', 'li');
      		// set up the delete handler
      		if (target && target.length === 1) {
      			setupDelete(target, deleteFn);
      			$(listElement).listview('refresh');
      		}
      	});

      	// use right swipe to hide the delete button on a task
      	$(listElement).on("swiperight", function (event) {
      		// find the LI element that enclose the element
      		// that received the swipe event
      		var target = $(event.target).parentsUntil('', 'li');
      		// set up the delete handler
      		if (target && target.length === 1) {
      			clearDelete(target);
      			$(listElement).listview('refresh');
      		}
      	});
      };


	// suppress Enter/Return in forms
  $("form :input").on("keypress", function(e) {
    return e.keyCode != 13;
  });

  
  // setup the swipe handlers on the tasks page
  // when creating it
  $( document ).on("pagecreate", "#tasks-page", function () {
    setupSwipes($('#tasks-list'), deleteTask);
    // register the event handler for creating tasks
    $("#add-task-add").on("click", createTask);
  });
  
  // reset the task list every time the tasks page is to be shown
  $( document ).on("pagebeforeshow", "#tasks-page", function (event) {
    $('#tasks-list').empty();
    taskList.forEach(function (task) {
      displayTask(task)
    });
    $('#tasks-list').listview('refresh');
    
  });

  // update the list item's task count on the list page
  // before switching away from the tasks page
  $( document ).on("pagebeforehide", "#tasks-page", function (event) {
    // update lists-page coount
    var selector = '#' + taskList.getId() + ' .ui-li-count';
    $(selector).html(taskList.getAll().length);
  });

  // initialize the list of taskLists page,
  $( document ).on("pagecreate", '#lists-page', function() {

    // add all the taskLists to the page
    app.forEach(displayTaskList);
    $('#lists-list').listview('refresh');
    
    // set up swipe controls on the task list
    setupSwipes($('#lists-list'), deleteTaskList);
    
    // add a click handler for the add taskList form
    $("#add-list-add").on("click", createTaskList);
    
    // add a click handler to the listview to control
    /// navigation into a taskList
    $("#lists-list").on("click", function (event) {
  		var target = $(event.target).parentsUntil('', 'li'),
          taskListId;

      // nothing else should be called for this event
      event.preventDefault();

      
      if (target && target.length > 0) {

        // get the id of the selected taskList
        taskListId = target.attr('id');

        // point taskList at the selected taskList
        taskList = app.get(taskListId);

        // update the tasks page header with the taskList's name
        $('#tasks-page header h1').html(taskList.getName());

        // switch to the tasks page
        $( ":mobile-pagecontainer" ).pagecontainer( "change", $('#tasks-page'));
      }
    });
  });
});
