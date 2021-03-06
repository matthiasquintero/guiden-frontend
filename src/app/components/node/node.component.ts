import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Node } from '../../models/node';
import { DependenciesService } from 'src/app/services/dependencies.service';
import { MovementService } from 'src/app/services/movement.service';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css']
})
export class NodeComponent implements OnInit {
  @Input() node: Node;
  @Output() nodeChange: EventEmitter<Node> = new EventEmitter<Node>();
  @Input() prevNode: NodeComponent;
  @Output() prevNodeChange: EventEmitter<NodeComponent> = new EventEmitter<NodeComponent>();
  className: string = "";
  constructor(private dependenciesService: DependenciesService, private movementService: MovementService) { }

  ngOnInit(): void {
    if (this.node.isInShortestPath) {
      this.className = "node path";
    }
    else if (this.node.isStart) {
      this.className = "node start";
    }
    else if (this.node.isFinish) {
      this.className = "node finish";
    }
    else if (this.node.isVisited) {
      this.className = "node visited";
    }
    else {
      this.className = "node";
    }
  }

  nodeViewUpdate() {
    let movingEndNode: boolean = this.movementService.getMovingEndNode();
    let movingStartNode: boolean = this.movementService.getMovingStartNode();
    let updatingNodes: boolean = this.movementService.getUpdatingNodes();
    if (updatingNodes) {
      if (!movingEndNode && !movingStartNode && !this.node.isFinish && !this.node.isStart) {
        //toggle is wall
        this.node.isWall = !this.node.isWall;
        //change color if node is wall
        if (this.node.isWall && !this.node.isFinish && !this.node.isStart) {
          this.className = "node wall";
          //add to walls
          this.dependenciesService.addWall([this.node.row, this.node.column]);
        }
        else if (!this.node.isWall && !this.node.isFinish && !this.node.isStart) {
          this.className = "node";
        }
      }
    }
    //node is start/end node
    else {
      //move start node
      if (movingStartNode && typeof this.prevNode != "undefined") {
        if (this.node.isFinish || this.prevNode.node.isFinish) {
          this.movementService.setMovingStartNode(false);
        } else {
          //set new start point
          this.dependenciesService.setStart([this.node.row, this.node.column]);
          //set previous node to blank spot
          this.prevNode.node.isStart = false;
          this.prevNode.className = "node";
          //set new style to node start
          this.node.isStart = true;
          this.className = "node start";
        }
      }
      //move end node
      else if (movingEndNode && typeof this.prevNode != "undefined") {
        if (this.node.isStart || this.prevNode.node.isStart) {
          this.movementService.setMovingEndNode(false);
        }
        else {
          //set new end point
          this.dependenciesService.setFinish([this.node.row, this.node.column]);
          //set previous node to blank spot
          this.prevNode.node.isFinish = false;
          this.prevNode.className = "node";
          //set new style to node end
          this.node.isFinish = true;
          this.className = "node finish";
        }
      }
      this.prevNode = this;
      this.prevNodeChange.emit(this.prevNode);
    }
    this.nodeChange.emit(this.node);
  }

  startUpdate() {
    if (this.node.isStart) {
      this.movementService.setMovingStartNode(true);
    }
    else if (this.node.isFinish) {
      this.movementService.setMovingEndNode(true);
    }
    else {
      this.movementService.setUpdatingNodes(true);
    }
    this.nodeViewUpdate();
  }

  stopUpdate() {
    this.movementService.setUpdatingNodes(false);
    this.movementService.setMovingStartNode(false);
    this.movementService.setMovingEndNode(false);
    //prevent immediate new placement from overwriting current placement
    this.prevNodeChange.emit(undefined);
  }

}
