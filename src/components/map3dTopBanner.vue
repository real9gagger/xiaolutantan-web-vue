<template>
    <div class="mtb-container fx-r tc-ff">
        <div class="hi-f fx-g1 bg-00 mtb-z1-fold-ani" style="transform-origin:100% 50%;transform:rotateY(-5deg);">1234567890987654321</div>
        <div class="hi-f fx-g1 fx-r mtb-z2-fold-ani" style="transform-origin:0% 50%;transform:rotateY(5deg);perspective:50rem;perspective-origin: 50% 50%;">
            <div class="hi-f fx-g1" style="background-color:#f00;">1234567890987654321</div>
            <div class="hi-f fx-g1 mtb-z3-fold-ani" style="background-color:#09f;transform-origin:0% 50%;transform:rotateY(-5deg);">1234567890987654321</div>
        </div>
    </div>
</template>

<script setup name="Map3DTopBanner">
    
</script>

<style>
    @keyframes mtb-z1-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        50% {
            transform: rotateY(-90deg);
        }
        100% {
            transform: rotateY(-90deg);
        }
    }
    @keyframes mtb-z2-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        50% {
            transform: rotateY(90deg);
        }
        75% {
            transform: rotateY(0deg) scaleX(1);
        }
        100% {
            transform: rotateY(0deg) scaleX(2);
        }
    }
    @keyframes mtb-z3-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        50% {
            transform: rotateY(-180deg);
        }
        100% {
            transform: rotateY(-180deg);
        }
    }
    
    .mtb-container{
        position: fixed;
        top: 0.5rem;
        z-index: 8888;
        max-width: 25rem;
        width: calc(100% - 1rem);
        left: max(calc(50vw - 12.5rem), 0.5rem);
        height: 2rem;
        /* border-radius: 2rem;
        box-shadow: 0 0 0.5rem 0 #ccc;
        background-color: #fff; */
        perspective: 50rem;
        perspective-origin: 50% 50%;
    }
    .mtb-z1-fold-ani{
        animation: mtb-z1-fold-kf 6s ease infinite 0s alternate;
    }
    .mtb-z2-fold-ani{
        animation: mtb-z2-fold-kf 6s ease infinite 0s alternate;
    }
    .mtb-z3-fold-ani{
        animation: mtb-z3-fold-kf 6s ease infinite 0s alternate;
    }
</style>