using UnityEngine;
namespace LanternKeeper {
    [RequireComponent(typeof(Animator))]
    public sealed class LanternCharacterMotion : MonoBehaviour {
        public enum Movement { Idle, Walk, Wave, Celebrate }
        private Animator animator;
        private void Awake() { animator = GetComponent<Animator>(); }
        public void Play(Movement movement) {
            if (!animator) animator = GetComponent<Animator>();
            animator.CrossFadeInFixedTime(movement.ToString(), 0.3f, 0, 0f);
        }
        public void SetPaused(bool paused) { GetComponent<Animator>().speed = paused ? 0f : 1f; }
    }
}
