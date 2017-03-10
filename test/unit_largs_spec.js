/* global expect */
const debug = require('debug')('dply:test:replacer:unit:largs')
const { Largs } = require('../lib/largs')


describe('Unit::largs', function(){


  describe('Class', function(){

    it('normalise args', function(){
      let l = new Largs('proc')
      l.normaliseArgv(['-b'])
      expect( ()=> l.normaliseArgv(['-']) ).to.throw('No argument')
      expect( ()=> l.normaliseArgv(['--']) ).to.throw('No argument')
      l.normaliseArgv(['-bwa'])
      l.normaliseArgv(['-bw', 'test'])
      l.normaliseArgv(['-b', '-w'])
      l.normaliseArgv(['--b', '--w'])
      l.normaliseArgv(['--ba', '--wa'])
      expect( ()=> l.normaliseArgv(['---']) ).to.throw('Invalid argument')
    })

  })


  describe('Largs', function(){

    let l = null

    beforeEach('setup the largs instance', function(){
      l = new Largs('id')
      l.arg('require')
      l.arg('ui')
      l.arg('bail').short('b').type('flag')
      l.arg('watch').short('w').type('flag')
    })

    it('should import the Largs class', function(){
      expect( l.label ).to.equal( 'id' )
    })

    it('should process mocha like argv', function(){
      l.arg('b').type('boolean')
      debug('l.config', l.config)
      let argv = [ '/bin/node',
        '/bin/_mocha',
        '--require',
        './test/fixture/mocha-setup.js',
        '--ui',
        'bdd',
        '-bw'
      ]
      expect( l.go(argv) ).to.be.ok
    })

    it('should process a positional argv', function(){
      let argv = [ '/bin/node', 'script.js',
        'first',
        'second',
        'third'
      ]
      expect( l.go(argv) ).to.be.ok
      expect( l.config_positional[0]._value ).to.equal( 'first' )
      expect( l.config_positional[1]._value ).to.equal( 'second' )
      expect( l.config_positional[2]._value ).to.equal( 'third' )
      expect( l.toJSON().positional ).to.eql( ['first', 'second', 'third'] )
    })

    it('should process combined argv', function(){
      let argv = [ '/bin/node',
        '/bin/_mocha',
        '--require',
        './a.js',
        './b.js'
      ]
      expect( l.go(argv) ).to.be.ok
      expect( l.config.require._value ).to.equal( './a.js' )
      expect( l.config_positional[0]._value ).to.equal( './b.js' )
    })

    it('should export json', function(){
      let argv = [ 'node', 't.js', '--require', 'a', '-b', '-w']
      l.go(argv)
      expect( l.toJSON().options ).eql({
        bail: true,
        watch: true,
        require: 'a',
        ui: undefined
      })
    })

    it('should error on an unknown flag', function(){
      l = new Largs('id')
      l.arg('barry')
      let fn = ()=> l.go(['node','js','--worry'])
      expect( fn ).throw(/The "worry" argument is unknown/)
    })

    it('should error on an unknown flag', function(){
      l = new Largs('id')
      l.arg('b').required()
      let fn = ()=> l.go(['node','js','-w'])
      expect( fn ).throw(/The "w" argument is unknown/)
    })

    it('should require a required long and short flag', function(){
      l = new Largs('id')
      l.arg('barry').short('b').required()
      let fn = ()=> l.go(['node','js'])
      expect( fn ).throw('The "--barry/-b" argument is required')
    })

    it('should require a required long flag', function(){
      l = new Largs('id')
      l.arg('barry').required()
      let fn = ()=> l.go(['node','js'])
      expect( fn ).throw('The "--barry" argument is required')
    })

    it('should require a required short flag', function(){
      l = new Largs('id')
      l.arg('b').required()
      let fn = ()=> l.go(['node','js'])
      expect( fn ).throw('The "-b" argument is required')
    })

    it('should allow combined flags when only the last needs a parameter', function(){
      l = new Largs('id')
      l.arg('w').type('flag')
      l.arg('a').type('flag')
      l.arg('b')
      l.go(['node','js','-wab', 'last'])
      expect( l.toJSON().options ).eql({
        b: 'last',
        w: true,
        a: true
      })
    })

    it('shouldn\'t allow combined flags that need a parameters', function(){
      l = new Largs('id')
      l.arg('b')
      l.arg('w').type('flag')
      let fn = ()=> l.go(['node','js','-bw', 'last'])
      expect( fn ).to.throw(/Combined arguments must be flags/)
    })

    it('shouldn\'t allow combined flags that need a parameter', function(){
      l = new Largs('id')
      l.arg('b')
      l.arg('w').type('flag')
      let fn = ()=> l.go(['node','js','-bw'])
      expect( fn ).to.throw(/Combined arguments must be flags/)
    })

  })

})
