Ext.define('Rally.ui.cardboard.plugin.ArtifactCardPopover', {
    alias: 'plugin.artifactcardpopover',
    extend: 'Ext.AbstractPlugin',
    requires: ['Rally.ui.popover.PopoverFactory'],

    init: function(card) {
        this.card = card;
        this.card.popoverPlugin = this;
        this.card.on('rerender', this._onRerender, this);
        this.card.on('fieldclick', this._onFieldClick, this);
        this.card.on('mouseout', this._hidePopover, this);
    },

    destroy: function() {
        if (this.card) {
            delete this.card.popoverPlugin;
            delete this.card;
        }

        if (this.popover) {
            this.popover.destroy();
            delete this.popover;
        }

        this.callParent(arguments);
    },

    showDescription: function() {
        if (/portfolioitem/.test(this.card.getRecord().getType())){
          if (!Ext.getElementById('description-popover')) {
            Ext.create('Rally.data.wsapi.Store',{
                model: this.card.getRecord().getType(),
                fetch: ['FormattedID','Name','PlannedEndDate'],
                filters: [{
                  property: 'ObjectID',
                  value: this.card.getRecord().getOid()
                }]
            }).load({
                callback: function(records, operation){
                    if (operation.wasSuccessful()){
                      this._createPopover({
                          context: this.card.context,
                          field: 'Description',
                          record: records[0],
                          offsetFromTarget: [{x:0, y:-10}, {x:12, y:0}, {x:0, y:10}, {x:-15, y:0}],
                          target: this.card.getEl().down('.formatted-id-template'),
                          targetSelector: '.' + this.card.getCardRecordCls() + ' .formatted-id-template'
                      });
                  }
                },
                scope: this
          });
        }
      }
    },
    showItem: function(){
        if (/portfolioitem/.test(this.card.getRecord().getType())){

            Ext.create('Rally.data.wsapi.Store',{
                model: this.card.getRecord().getType(),
                fetch: ['FormattedID','Name','PlannedEndDate'],
                filters: [{
                  property: 'ObjectID',
                  value: this.card.getRecord().getOid()
                }]
            }).load({
                callback: function(records, operation){
                    if (operation.wasSuccessful()){
                      this._createPopover({
                          field: 'UserStory',
                          record: records[0],
                          offsetFromTarget: [{x:0, y:-10}, {x:12, y:0}, {x:0, y:10}, {x:-15, y:0}],
                          target: this.card.getEl().down('.ItemSummary'),
                          targetSelector: '.' + this.card.getCardRecordCls() + ' .ItemSummary',
                          listViewConfig: {
                              gridConfig: {
                                  columnCfgs: ['FormattedID','Name','ScheduleState','PlanEstimate','Owner'],
                                  enableRanking: false
                              }
                          }
                      });
                  }
                },
                scope: this
          });

      } else {


        this.card.select();
        if (this.popover) {
            this.popover.hide();
            this.popover.destroy();
        }

        this.popover = Ext.create('Rally.ui.popover.OrphanPopover',{
          modelNames: this.card.getRecord().getItemModels(),
          title: this.card.getRecord().getGroupName(),
          gridConfig: {
              columnCfgs: ['FormattedID','Name','ScheduleState','PlanEstimate','Owner'],
              storeConfig: {
                  filters: this.card.getRecord().getItemFilters(),
                  context: { project: null }
              }
          },
          offsetFromTarget: [{x:0, y:-10}, {x:12, y:0}, {x:0, y:10}, {x:-15, y:0}],
          target: this.card.getEl().down('.ItemSummary'),
          targetSelector: '.' + this.card.getCardRecordCls() + ' .ItemSummary',
          offsetFromTarget: [{x:0, y:-8}, {x:15, y:0}, {x:5, y:8}, {x:-15, y:0}],
          autoShow: false
        });
        this.popover.on('destroy', this._onPopoverDestroy, this);
        //this.popover.on('afterrender', this._onPopoverAfterRender, this);
        this.popover.show();

      }
    },
    showdependency: function(){
      this.card.select();
      if (this.popover) {
          this.popover.destroy();
      }
      this.card.fireEvent('showdependency',this.card);
    },
    _createPopover: function(popoverCfg) {

        if (this.popover) {
            this._hidePopover();
            this.popover.destroy();
        }

        this.card.select();

        this.popover = Rally.ui.popover.PopoverFactory.bake(Ext.apply({
            autoShow: false,
            autoCenter: false
        }, popoverCfg));
        this.popover.on('destroy', this._onPopoverDestroy, this);
        this.popover.show();

    },

    _onPopoverDestroy: function() {
        if (this.card) {
            this.card.deselect();
        }
        delete this.popover;
    },

    _onPopoverAfterRender: function() {
        if (Rally.BrowserTest) {
            Rally.BrowserTest.publishComponentReady(this);
        }
    },

    _onFieldClick: function(fieldName) {
        var fn = this['show' + fieldName];
        if(Ext.isFunction(fn)) {
            fn.call(this);
        }
    },

    _onRerender: function() {
        if (this.popover) {
            this.popover.alignToTarget();
            if (this.popover.down('.rallylistview')) {
                this.popover.down('.rallylistview').realignGridEditor();
            }
        }
    },
    _hidePopover: function(e, target, options){
      if ( _.isArray(options) && options.length > 0 && !_.isUndefined(options[0]) ) {
        options[0].removeCls('hover');
      }
    
      Ext.defer(function() {
          if(this && this.rendered && !(this.target && this.target.hasCls('hover') || this.hasCls('hover') || (this.chevron && this.chevron.hasCls('hover')))){
              this.destroy();
          }
      }, 100, this);
  }
});
