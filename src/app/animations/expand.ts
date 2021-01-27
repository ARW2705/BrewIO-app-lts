import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata
} from '@angular/animations';

/**
 * Expand or collapse vertically while also transitioning opacity
 *
 * @params: none
 * @return: animation function
 */
export function expandUpDown(): AnimationTriggerMetadata {
  return trigger('expandUpDown', [
    state(
      'collapsed',
      style({
        maxHeight: 0,
        margin: 0,
        opacity: 0
      })
    ),
    state(
      'expanded',
      style({
        marginBottom: '5px',
        maxHeight: '{{ maxHeight }}px',
        opacity: 1
      }),
      {
        params: {
          maxHeight: 1000
        }
      }
    ),
    transition(
      'collapsed <=> expanded',
      [
        animate('{{ speed }}ms cubic-bezier(0.645, 0.045, 0.355, 1)')
      ],
      {
        params: {
          speed: 500
        }
      }
    )
  ]);
}
