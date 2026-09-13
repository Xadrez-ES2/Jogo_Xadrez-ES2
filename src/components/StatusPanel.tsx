


export function StatusPanel() {
    return (
        
        <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-semibold text-text-primary">Status</h2>
            
            <p className="mt-3 font-body text-sm text-text-muted">
                
                Vez das <span className="font-semibold text-accent">brancas</span>. 
                <br />
                <br />
                
                Painel voltado para exibir informações sobre o status da partida, como
                se há xeque, se há peça cravada, talvez vantagem de material, etc.
            
            </p>
        
        </div>
    );
}